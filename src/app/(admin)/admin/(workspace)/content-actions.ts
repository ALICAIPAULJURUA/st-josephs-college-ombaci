"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildValidator } from "@/content/schemas";
import { getPageSchema } from "@/content/schemas/registry";
import { db } from "@/db/client";
import { pages, revisions, settings } from "@/db/schema";
import { requireAdminRole } from "@/lib/admin/auth";
import { cacheTags } from "@/db/queries";
import { sanitizeRichTextFields } from "@/lib/admin/rich-text";

export type ContentActionState = {
  message?: string;
  error?: string;
  operationId?: string;
};

function editorRoute(key: string) {
  return key === "settings" ? "/admin/settings" : `/admin/pages/${key}`;
}

function fieldLabelForIssue(
  fields: Parameters<typeof sanitizeRichTextFields>[0],
  path: readonly PropertyKey[],
) {
  let currentFields = fields;
  let label = "this field";

  for (const part of path) {
    if (typeof part !== "string") continue;
    const field = currentFields.find((item) => item.name === part);
    if (!field) continue;
    label = field.label.toLowerCase();
    if (field.type === "group") currentFields = field.fields;
    else if (field.type === "list" && "itemFields" in field) {
      currentFields = field.itemFields;
    }
  }

  return label;
}

function validationMessage(
  fields: Parameters<typeof sanitizeRichTextFields>[0],
  issue: z.ZodIssue,
) {
  const label = fieldLabelForIssue(fields, issue.path);
  return issue.code === "too_small"
    ? `Please add ${label}.`
    : `Please check ${label}.`;
}

function objectValues(value: unknown) {
  const parsed = z.record(z.string(), z.unknown()).safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function savePageContentAction(
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const key = formData.get("key");
  const schema = getPageSchema(key);
  if (!schema) return { error: "That page is not available to edit." };

  const user = await requireAdminRole(
    schema.key === "settings" ? ["admin"] : ["admin", "editor"],
  );
  const intent = formData.get("intent");
  if (intent !== "draft" && intent !== "publish") {
    return { error: "Choose Save draft or Publish to continue." };
  }

  const rawFields = formData.get("fields");
  if (typeof rawFields !== "string") {
    return { error: "We could not read those changes. Please try again." };
  }

  let jsonFields: unknown;
  try {
    jsonFields = JSON.parse(rawFields);
  } catch {
    return { error: "We could not read those changes. Please try again." };
  }

  const record = objectValues(jsonFields);
  if (!record) return { error: "Please check the page details and try again." };

  const cleaned = sanitizeRichTextFields(schema.fields, record);
  const validation = buildValidator(schema).safeParse(cleaned);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return {
      error: issue
        ? validationMessage(schema.fields, issue)
        : "Please check the page details and try again.",
    };
  }

  const fields = validation.data;
  const now = Date.now();
  const operationId = randomUUID();
  const settingsPage = schema.key === "settings";

  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(pages)
        .where(eq(pages.key, schema.key))
        .limit(1);

      if (intent === "draft") {
        if (existing) {
          await tx
            .update(pages)
            .set({
              draftFields: fields,
              draftUpdatedBy: user.email,
              draftUpdatedAt: now,
            })
            .where(eq(pages.key, schema.key));
        } else {
          await tx.insert(pages).values({
            key: schema.key,
            fields,
            draftFields: fields,
            draftUpdatedBy: user.email,
            draftUpdatedAt: now,
            status: "hidden",
            updatedAt: now,
          });
        }
      } else {
        if (settingsPage) {
          for (const [settingKey, value] of Object.entries(fields)) {
            await tx
              .insert(settings)
              .values({
                key: settingKey,
                value,
                updatedBy: user.email,
                updatedAt: now,
              })
              .onConflictDoUpdate({
                target: settings.key,
                set: { value, updatedBy: user.email, updatedAt: now },
              });
          }
        }
        if (existing) {
          await tx
            .update(pages)
            .set({
              fields,
              draftFields: null,
              draftUpdatedBy: null,
              draftUpdatedAt: null,
              status: settingsPage ? existing.status : "published",
              updatedBy: user.email,
              updatedAt: now,
            })
            .where(eq(pages.key, schema.key));
        } else {
          await tx.insert(pages).values({
            key: schema.key,
            fields,
            status: settingsPage ? "hidden" : "published",
            updatedBy: user.email,
            updatedAt: now,
          });
        }
      }

      await tx.insert(revisions).values({
        id: operationId,
        recordType: settingsPage ? "settings" : "page",
        recordId: schema.key,
        snapshot: {
          fields,
          status: intent,
          updatedAt: now,
        },
        user: user.email,
        createdAt: now,
      });
    });

    if (intent === "publish") {
      if (settingsPage) {
        updateTag(cacheTags.settings);
        revalidatePath("/", "layout");
      } else {
        updateTag(cacheTags.pages);
        updateTag(cacheTags.page(schema.key));
        revalidatePath(schema.route);
      }
    }
    revalidatePath(editorRoute(schema.key));

    return {
      message: intent === "draft" ? "Draft saved." : "Changes published.",
      operationId,
    };
  } catch (error) {
    console.error("Could not save page content.", error);
    return {
      error: "We could not save those changes. Please try again.",
    };
  }
}

export async function restorePageRevisionAction(formData: FormData) {
  const key = formData.get("key");
  const revisionId = formData.get("revisionId");
  const schema = getPageSchema(key);
  if (
    !schema ||
    typeof revisionId !== "string" ||
    !z.uuid().safeParse(revisionId).success
  ) {
    redirect("/admin/pages?notice=restore-unavailable");
  }

  const user = await requireAdminRole(
    schema.key === "settings" ? ["admin"] : ["admin", "editor"],
  );
  const recordType = schema.key === "settings" ? "settings" : "page";
  const [revision] = await db
    .select()
    .from(revisions)
    .where(
      and(
        eq(revisions.id, revisionId),
        eq(revisions.recordType, recordType),
        eq(revisions.recordId, schema.key),
      ),
    )
    .limit(1);
  const snapshot = revision ? objectValues(revision.snapshot) : null;
  const snapshotFields = snapshot ? objectValues(snapshot.fields) : null;
  if (!snapshotFields) {
    redirect(`${editorRoute(schema.key)}?notice=restore-unavailable`);
  }

  const cleaned = sanitizeRichTextFields(schema.fields, snapshotFields);
  const validated = buildValidator(schema).safeParse(cleaned);
  if (!validated.success) {
    redirect(`${editorRoute(schema.key)}?notice=restore-unavailable`);
  }

  const now = Date.now();
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(pages)
      .where(eq(pages.key, schema.key))
      .limit(1);
    if (existing) {
      await tx
        .update(pages)
        .set({
          draftFields: validated.data,
          draftUpdatedBy: user.email,
          draftUpdatedAt: now,
        })
        .where(eq(pages.key, schema.key));
    } else {
      await tx.insert(pages).values({
        key: schema.key,
        fields: validated.data,
        draftFields: validated.data,
        draftUpdatedBy: user.email,
        draftUpdatedAt: now,
        status: "hidden",
        updatedAt: now,
      });
    }
  });

  updateTag(schema.key === "settings" ? cacheTags.settings : cacheTags.pages);
  revalidatePath(editorRoute(schema.key));
  redirect(`${editorRoute(schema.key)}?notice=restored`);
}
