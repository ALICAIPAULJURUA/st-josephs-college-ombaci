import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { getCollectionSchema } from "@/content/schemas/collections";
import { pageSchemas } from "@/content/schemas/registry";
import { db } from "@/db/client";
import { items, media, revisions } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getMediaUrl } from "@/lib/admin/storage";
import { ListItemEditorForm } from "../../list-item-editor-form";
import type { EditorMediaItem } from "../../media-picker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const schema = getCollectionSchema(collection);
  return { title: schema ? `Edit ${schema.label}` : "Edit entry" };
}

export default async function AdminCollectionItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ collection, id }, { notice }] = await Promise.all([
    params,
    searchParams,
  ]);
  const schema = getCollectionSchema(collection);
  if (!schema) notFound();

  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  let recordId: string;
  try {
    recordId = decodeURIComponent(id);
  } catch {
    notFound();
  }

  const [recordRows, mediaRows, revisionRows] = await Promise.all([
    recordId === "new"
      ? Promise.resolve([])
      : db
          .select()
          .from(items)
          .where(and(eq(items.id, recordId), eq(items.collection, schema.key)))
          .limit(1),
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
    recordId === "new"
      ? Promise.resolve([])
      : db
          .select()
          .from(revisions)
          .where(
            and(
              eq(revisions.recordType, "item"),
              eq(revisions.recordId, recordId),
            ),
          )
          .orderBy(desc(revisions.createdAt))
          .limit(20),
  ]);
  const record = recordRows[0];
  if (recordId !== "new" && !record) notFound();

  const editorMedia: EditorMediaItem[] = mediaRows.map((entry) => ({
    id: entry.id,
    url: getMediaUrl(entry.file),
    alt: entry.alt,
    isSample: entry.isSample,
  }));
  const pageLinks = pageSchemas
    .filter((pageSchema) => pageSchema.key !== "settings")
    .map((pageSchema) => ({
      label: pageSchema.label,
      href: pageSchema.route,
    }));
  const editorRevisions = revisionRows.map((revision) => {
    const snapshot =
      revision.snapshot !== null && typeof revision.snapshot === "object"
        ? revision.snapshot
        : {};
    return {
      id: revision.id,
      user: revision.user,
      createdAt: revision.createdAt,
      status:
        "status" in snapshot && typeof snapshot.status === "string"
          ? snapshot.status
          : "saved",
    };
  });

  return (
    <ListItemEditorForm
      initialValues={record?.fields}
      isPublished={record?.status === "published"}
      itemId={record?.id ?? "new"}
      mediaItems={editorMedia}
      notice={notice}
      pageLinks={pageLinks}
      revisions={editorRevisions}
      schema={schema}
    />
  );
}
