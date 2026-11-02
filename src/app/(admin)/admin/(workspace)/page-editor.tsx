import { and, desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { homePageDefaults } from "@/content/defaults/home";
import { innerPageDefaults } from "@/content/defaults/inner-pages";
import { settingsDefaults } from "@/content/defaults/site";
import { pageSchemas } from "@/content/schemas/registry";
import { db } from "@/db/client";
import { media, pages, revisions, settings } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getMediaUrl } from "@/lib/admin/storage";

import { PageEditorForm } from "./page-editor-form";

type Values = Record<string, unknown>;

function isRecord(value: unknown): value is Values {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function summary(value: unknown, type: string): string {
  if (value === undefined || value === null || value === "") return "Empty";
  if (type === "toggle") return value === true ? "On" : "Off";
  if (typeof value === "string") {
    const text = type === "richtext" ? value.replace(/<[^>]*>/g, " ") : value;
    return text.replace(/\s+/g, " ").trim().slice(0, 100) || "Empty";
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `${value.length} entries`;
  if (isRecord(value)) {
    if (typeof value.alt === "string") return value.alt || "Photo details";
    if (typeof value.label === "string") return value.label || "Link details";
    return Object.entries(value)
      .map(([key, child]) => `${key}: ${summary(child, "text")}`)
      .join("; ")
      .slice(0, 100);
  }
  return "Empty";
}

function flattenValues(
  fields: readonly import("@/content/schemas").Field[],
  values: Values,
  prefix = "",
): Map<string, string> {
  const flattened = new Map<string, string>();

  for (const field of fields) {
    const value = values[field.name];
    const label = prefix ? `${prefix} · ${field.label}` : field.label;
    if (field.type === "group" && isRecord(value)) {
      for (const [nestedLabel, nestedValue] of flattenValues(
        field.fields,
        value,
        label,
      )) {
        flattened.set(nestedLabel, nestedValue);
      }
    } else if (field.type === "list" && Array.isArray(value)) {
      value.forEach((entry, index) => {
        const entryLabel = `${label} ${index + 1}`;
        if ("itemFields" in field && isRecord(entry)) {
          for (const [nestedLabel, nestedValue] of flattenValues(
            field.itemFields,
            entry,
            entryLabel,
          )) {
            flattened.set(nestedLabel, nestedValue);
          }
        } else {
          flattened.set(entryLabel, summary(entry, "text"));
        }
      });
    } else {
      flattened.set(label, summary(value, field.type));
    }
  }

  return flattened;
}

function changesForRevision(
  fields: readonly import("@/content/schemas").Field[],
  earlier: unknown,
  current: Values,
) {
  const before = flattenValues(fields, isRecord(earlier) ? earlier : {});
  const after = flattenValues(fields, current);
  const labels = new Set([...before.keys(), ...after.keys()]);

  return [...labels]
    .map((label) => ({
      label,
      before: before.get(label) ?? "Empty",
      after: after.get(label) ?? "Empty",
    }))
    .filter((change) => change.before !== change.after);
}

export async function PageEditor({
  schemaKey,
  notice,
}: {
  schemaKey: string;
  notice?: string;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const schema = pageSchemas.find((item) => item.key === schemaKey);
  if (!schema) notFound();
  if (schema.key === "settings" && user.role !== "admin") {
    redirect("/admin");
  }

  const [pageRows, settingsRows, mediaRows, revisionRows] = await Promise.all([
    db.select().from(pages).where(eq(pages.key, schema.key)).limit(1),
    schema.key === "settings"
      ? db.select().from(settings)
      : Promise.resolve([]),
    db
      .select({
        id: media.id,
        file: media.file,
        alt: media.alt,
        isSample: media.isSample,
      })
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(100),
    db
      .select()
      .from(revisions)
      .where(
        and(
          eq(
            revisions.recordType,
            schema.key === "settings" ? "settings" : "page",
          ),
          eq(revisions.recordId, schema.key),
        ),
      )
      .orderBy(desc(revisions.createdAt))
      .limit(20),
  ]);
  const record = pageRows[0];
  const savedSettings = Object.fromEntries(
    settingsRows.map((row) => [row.key, row.value]),
  );
  const defaults =
    schema.key === "home"
      ? homePageDefaults
      : schema.key === "settings"
        ? settingsDefaults
        : (innerPageDefaults[schema.key] ?? {});
  const liveFields =
    schema.key === "settings"
      ? { ...settingsDefaults, ...savedSettings }
      : (record?.fields ?? defaults);
  const editorFields = record?.draftFields ?? liveFields;
  const revisionsForEditor = revisionRows.map((revision) => {
    const snapshot = isRecord(revision.snapshot) ? revision.snapshot : {};
    return {
      id: revision.id,
      user: revision.user,
      createdAt: revision.createdAt,
      status: typeof snapshot.status === "string" ? snapshot.status : "saved",
      fields: snapshot.fields,
      changes: changesForRevision(schema.fields, snapshot.fields, editorFields),
    };
  });
  const pageLinks = pageSchemas
    .filter((item) => item.key !== "settings")
    .map((item) => ({ label: item.label, href: item.route }));
  const editorMedia = mediaRows.map((item) => ({
    id: item.id,
    url: getMediaUrl(item.file),
    alt: item.alt,
    isSample: item.isSample,
  }));
  const latestSetting = settingsRows.reduce<
    (typeof settingsRows)[number] | undefined
  >(
    (latest, row) =>
      !latest || row.updatedAt > latest.updatedAt ? row : latest,
    undefined,
  );
  const lastEditedBy =
    record?.draftUpdatedBy ??
    record?.updatedBy ??
    latestSetting?.updatedBy ??
    undefined;
  const lastEditedAt =
    record?.draftUpdatedAt ??
    record?.updatedAt ??
    latestSetting?.updatedAt ??
    undefined;

  return (
    <PageEditorForm
      key={`${schema.key}-${notice ?? "editor"}`}
      initialValues={editorFields}
      isPublished={schema.key === "settings" || record?.status === "published"}
      lastEditedAt={lastEditedAt}
      lastEditedBy={lastEditedBy}
      mediaItems={editorMedia}
      notice={
        notice === "restored"
          ? "This earlier version is now a draft. Review it, then save or publish it."
          : notice === "restore-unavailable"
            ? "That earlier version is no longer available."
            : undefined
      }
      pageLinks={pageLinks}
      revisions={revisionsForEditor}
      schema={schema}
      status={record?.status ?? "hidden"}
    />
  );
}
