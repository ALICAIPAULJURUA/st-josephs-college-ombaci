"use server";

import { randomUUID } from "node:crypto";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildValidator } from "@/content/schemas";
import { getCollectionSchema } from "@/content/schemas/collections";
import { db } from "@/db/client";
import { items, redirects, revisions } from "@/db/schema";
import { cacheTags } from "@/db/queries";
import { requireAdminRole } from "@/lib/admin/auth";
import { contentItemPath, isSafeContentPath } from "@/lib/content-path";
import { sanitizeRichTextFields } from "@/lib/admin/rich-text";
import { collectionSchemas } from "@/content/schemas/collections";
import { getPageSchemaByRoute } from "@/content/schemas/registry";

export type ListActionState = {
  error?: string;
  message?: string;
};

function invalidateCollection(collection: string, route: string) {
  updateTag(cacheTags.items);
  updateTag(cacheTags.collection(collection));
  updateTag(cacheTags.redirects);
  revalidatePath(route);
  revalidatePath("/", "layout");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function consentIsMissing(schemaKey: string, fields: Record<string, unknown>) {
  const consentRecorded = fields.consentRecorded === true;
  if (consentRecorded || fields.isSample === true) return false;
  const hasPhoto = (value: unknown): boolean => {
    if (!isRecord(value)) return false;
    return typeof value.src === "string" && value.src.length > 0;
  };
  if (schemaKey === "people" || schemaKey === "old-boys") {
    return hasPhoto(fields.photo);
  }
  if (schemaKey === "gallery" && Array.isArray(fields.photos)) {
    return fields.photos.some(
      (entry) => isRecord(entry) && hasPhoto(entry.photo),
    );
  }
  return false;
}

function parseFields(formData: FormData) {
  const raw = formData.get("fields");
  if (typeof raw !== "string") return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export async function saveCollectionItemAction(
  _previousState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const collectionValue = formData.get("collection");
  const schema = getCollectionSchema(collectionValue);
  if (!schema) return { error: "That list is not available." };

  const user = await requireAdminRole(["admin", "editor"]);
  const intent = formData.get("intent");
  if (intent !== "draft" && intent !== "publish") {
    return { error: "Choose Save draft or Publish to continue." };
  }
  const idValue = formData.get("id");
  const id =
    typeof idValue === "string" && idValue !== "new" ? idValue : undefined;
  const submitted = parseFields(formData);
  if (!submitted) {
    return { error: "We could not read those changes. Please try again." };
  }

  const cleaned = sanitizeRichTextFields(schema.fields, submitted);
  const validation = buildValidator(schema).safeParse(cleaned);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return {
      error:
        issue?.code === "too_small"
          ? "Please fill in the required details."
          : "Please check the details and try again.",
    };
  }
  const fields: Record<string, unknown> = Object.assign({}, validation.data);
  if (intent === "publish" && consentIsMissing(schema.key, fields)) {
    return {
      error:
        "Please record permission for identifiable people before publishing this photo.",
    };
  }

  const now = Date.now();
  const itemId = id ?? randomUUID();
  const slugValue = fields.slug;
  if (typeof slugValue !== "string" || !slugValue.trim()) {
    return { error: "Please add a web address ending." };
  }
  const slug = slugValue.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      error: "Use lower-case letters, numbers and hyphens in the web address.",
    };
  }
  const extraRoute = typeof fields.route === "string" ? fields.route : null;
  if (
    schema.key === "extra-pages" &&
    (!contentItemPath(schema.key, slug, fields) ||
      !extraRoute ||
      !isSafeContentPath(extraRoute) ||
      getPageSchemaByRoute(extraRoute) ||
      collectionSchemas.some((collection) => collection.route === extraRoute) ||
      ["/news/", "/sports/", "/achievements/", "/old-boys/"].some((prefix) =>
        extraRoute.startsWith(prefix),
      ))
  ) {
    return { error: "Use a unique, lower-case page address beginning with /." };
  }

  let oldPath: string | null = null;
  const newPath = contentItemPath(schema.key, slug, fields);
  try {
    await db.transaction(async (tx) => {
      const [existing] = id
        ? await tx
            .select()
            .from(items)
            .where(and(eq(items.id, id), eq(items.collection, schema.key)))
            .limit(1)
        : [];
      if (id && !existing) {
        throw new Error("The list entry could not be found.");
      }

      if (existing) {
        oldPath = contentItemPath(schema.key, existing.slug, existing.fields);
      }

      const [sameAddress] = await tx
        .select({ id: items.id })
        .from(items)
        .where(
          and(
            eq(items.collection, schema.key),
            eq(items.slug, slugValue.trim()),
          ),
        )
        .limit(1);
      if (sameAddress && sameAddress.id !== itemId) {
        throw new Error(
          "That web address ending is already used in this list.",
        );
      }

      if (schema.key === "extra-pages" && typeof fields.route === "string") {
        const routes = await tx
          .select({ id: items.id, fields: items.fields })
          .from(items)
          .where(eq(items.collection, schema.key));
        if (
          routes.some(
            (row) => row.id !== itemId && row.fields.route === fields.route,
          )
        ) {
          throw new Error("That page address is already in use.");
        }
      }

      if (existing) {
        await tx
          .update(items)
          .set({
            slug,
            fields,
            status: intent === "publish" ? "published" : "hidden",
            updatedAt: now,
          })
          .where(eq(items.id, existing.id));
      } else {
        await tx.insert(items).values({
          id: itemId,
          collection: schema.key,
          slug,
          fields,
          status: intent === "publish" ? "published" : "hidden",
          sortOrder: 0,
          updatedAt: now,
        });
      }

      if (oldPath && newPath && oldPath !== newPath) {
        await tx.delete(redirects).where(eq(redirects.source, newPath));
        await tx
          .update(redirects)
          .set({ destination: newPath })
          .where(eq(redirects.destination, oldPath));
        await tx
          .insert(redirects)
          .values({ source: oldPath, destination: newPath, createdAt: now })
          .onConflictDoUpdate({
            target: redirects.source,
            set: { destination: newPath, createdAt: now },
          });
      }

      await tx.insert(revisions).values({
        id: randomUUID(),
        recordType: "item",
        recordId: itemId,
        snapshot: {
          collection: schema.key,
          slug,
          fields,
          status: intent === "publish" ? "published" : "hidden",
        },
        user: user.email,
        createdAt: now,
      });

      const latestRevisionIds = tx
        .select({ id: revisions.id })
        .from(revisions)
        .where(
          and(eq(revisions.recordType, "item"), eq(revisions.recordId, itemId)),
        )
        .orderBy(desc(revisions.createdAt))
        .limit(20);
      await tx
        .delete(revisions)
        .where(
          and(
            eq(revisions.recordType, "item"),
            eq(revisions.recordId, itemId),
            notInArray(revisions.id, latestRevisionIds),
          ),
        );
    });

    invalidateCollection(schema.key, schema.route);
    revalidatePath(`/admin/${schema.key}`);
    if (oldPath) revalidatePath(oldPath);
    if (newPath) revalidatePath(newPath);
    return {
      message: intent === "publish" ? "Changes published." : "Draft saved.",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("That web address")
    ) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.startsWith("The list entry")) {
      return { error: error.message };
    }
    if (
      error instanceof Error &&
      error.message.startsWith("That page address")
    ) {
      return { error: error.message };
    }
    console.error("Could not save list entry.", error);
    return { error: "We could not save those changes. Please try again." };
  }
}

export async function setCollectionItemStatusAction(formData: FormData) {
  const collection = formData.get("collection");
  const id = formData.get("id");
  const status = formData.get("status");
  const schema = getCollectionSchema(collection);
  if (
    !schema ||
    typeof id !== "string" ||
    !id ||
    (status !== "published" && status !== "hidden")
  ) {
    redirect("/admin");
  }
  await requireAdminRole(["admin", "editor"]);
  await db
    .update(items)
    .set({ status, updatedAt: Date.now() })
    .where(and(eq(items.id, id), eq(items.collection, schema.key)));
  invalidateCollection(schema.key, schema.route);
  redirect(`/admin/${schema.key}`);
}

export async function deleteCollectionItemAction(formData: FormData) {
  const collection = formData.get("collection");
  const id = formData.get("id");
  const schema = getCollectionSchema(collection);
  if (!schema || typeof id !== "string" || !id) redirect("/admin");
  await requireAdminRole(["admin", "editor"]);
  await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.collection, schema.key)));
  invalidateCollection(schema.key, schema.route);
  redirect(`/admin/${schema.key}`);
}

export async function moveCollectionItemAction(formData: FormData) {
  const collection = formData.get("collection");
  const id = formData.get("id");
  const direction = formData.get("direction");
  const schema = getCollectionSchema(collection);
  if (
    !schema ||
    typeof id !== "string" ||
    !id ||
    (direction !== "up" && direction !== "down")
  ) {
    redirect("/admin");
  }
  await requireAdminRole(["admin", "editor"]);

  const rows = await db
    .select()
    .from(items)
    .where(eq(items.collection, schema.key))
    .orderBy(items.sortOrder);
  const index = rows.findIndex((row) => row.id === id);
  const neighbor = rows[index + (direction === "up" ? -1 : 1)];
  if (index >= 0 && neighbor) {
    await db.transaction(async (tx) => {
      await tx
        .update(items)
        .set({ sortOrder: neighbor.sortOrder })
        .where(eq(items.id, id));
      await tx
        .update(items)
        .set({ sortOrder: rows[index].sortOrder })
        .where(eq(items.id, neighbor.id));
    });
  }
  invalidateCollection(schema.key, schema.route);
  redirect(`/admin/${schema.key}`);
}

const revisionFormSchema = z.object({
  collection: z.string().min(1),
  id: z.string().min(1),
  revisionId: z.uuid(),
});

export async function restoreCollectionItemRevisionAction(formData: FormData) {
  const parsed = revisionFormSchema.safeParse({
    collection: formData.get("collection"),
    id: formData.get("id"),
    revisionId: formData.get("revisionId"),
  });
  if (!parsed.success) redirect("/admin");
  const schema = getCollectionSchema(parsed.data.collection);
  if (!schema) redirect("/admin");
  const user = await requireAdminRole(["admin", "editor"]);
  const [revision] = await db
    .select()
    .from(revisions)
    .where(
      and(
        eq(revisions.id, parsed.data.revisionId),
        eq(revisions.recordType, "item"),
        eq(revisions.recordId, parsed.data.id),
      ),
    )
    .limit(1);
  if (!revision) redirect(`/admin/${schema.key}/${parsed.data.id}`);
  const snapshot = isRecord(revision.snapshot) ? revision.snapshot : {};
  const previousFields = snapshot.fields;
  if (!isRecord(previousFields)) {
    redirect(`/admin/${schema.key}/${parsed.data.id}`);
  }
  const cleaned = sanitizeRichTextFields(schema.fields, previousFields);
  const validation = buildValidator(schema).safeParse(cleaned);
  if (!validation.success) redirect(`/admin/${schema.key}/${parsed.data.id}`);

  const savedFields: Record<string, unknown> = Object.assign(
    {},
    validation.data,
  );
  const slug = savedFields.slug;
  if (typeof slug !== "string")
    redirect(`/admin/${schema.key}/${parsed.data.id}`);
  const [currentItem] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, parsed.data.id), eq(items.collection, schema.key)))
    .limit(1);
  if (!currentItem) redirect(`/admin/${schema.key}`);
  const oldPath = contentItemPath(
    schema.key,
    currentItem.slug,
    currentItem.fields,
  );
  const newPath = contentItemPath(schema.key, slug, savedFields);
  const now = Date.now();
  await db.transaction(async (tx) => {
    await tx
      .update(items)
      .set({
        slug,
        fields: savedFields,
        status: "hidden",
        updatedAt: now,
      })
      .where(
        and(eq(items.id, parsed.data.id), eq(items.collection, schema.key)),
      );
    if (oldPath && newPath && oldPath !== newPath) {
      await tx.delete(redirects).where(eq(redirects.source, newPath));
      await tx
        .update(redirects)
        .set({ destination: newPath })
        .where(eq(redirects.destination, oldPath));
      await tx
        .insert(redirects)
        .values({ source: oldPath, destination: newPath, createdAt: now })
        .onConflictDoUpdate({
          target: redirects.source,
          set: { destination: newPath, createdAt: now },
        });
    }
    await tx.insert(revisions).values({
      id: randomUUID(),
      recordType: "item",
      recordId: parsed.data.id,
      snapshot: {
        fields: savedFields,
        status: "hidden",
        restoredFrom: revision.id,
      },
      user: user.email,
      createdAt: now,
    });
  });
  invalidateCollection(schema.key, schema.route);
  if (oldPath) revalidatePath(oldPath);
  if (newPath) revalidatePath(newPath);
  redirect(`/admin/${schema.key}/${parsed.data.id}?notice=restored`);
}
