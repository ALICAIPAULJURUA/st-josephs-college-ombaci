import { createHash } from "node:crypto";
import { and, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "./client";
import { items, pages, redirects, settings } from "./schema";

const databaseCacheNamespace = createHash("sha256")
  .update(process.env.DATABASE_URL || "pglite:./data/postgres")
  .digest("hex")
  .slice(0, 16);

function scopedCacheTag(tag: string) {
  return `database:${databaseCacheNamespace}:${tag}`;
}

export const cacheTags = {
  settings: scopedCacheTag("settings"),
  pages: scopedCacheTag("pages"),
  page: (key: string) => scopedCacheTag(`page:${key}`),
  items: scopedCacheTag("items"),
  collection: (collection: string) =>
    scopedCacheTag(`collection:${collection}`),
  redirects: scopedCacheTag("redirects"),
};

export async function getSettingsRows(keys?: readonly string[]) {
  const rows = await db
    .select({
      key: settings.key,
      value: sql<string>`${settings.value}::text`,
      updatedBy: settings.updatedBy,
      updatedAt: settings.updatedAt,
    })
    .from(settings)
    .where(keys ? inArray(settings.key, [...keys]) : undefined);

  return rows.map(({ value, ...row }) => {
    const parsedValue: unknown = JSON.parse(value);
    return { ...row, value: parsedValue };
  });
}

export function getSettings() {
  return unstable_cache(
    async (): Promise<Record<string, unknown>> => {
      return Object.fromEntries(
        (await getSettingsRows()).map(({ key, value }) => [key, value]),
      );
    },
    ["settings", databaseCacheNamespace],
    { revalidate: 60, tags: [cacheTags.settings] },
  )();
}

export function getPage(key: string) {
  return unstable_cache(
    async () => {
      const rows = await db
        .select()
        .from(pages)
        .where(and(eq(pages.key, key), eq(pages.status, "published")))
        .limit(1);
      const row = rows[0];

      if (!row) return null;

      return {
        key: row.key,
        status: row.status,
        updatedBy: row.updatedBy ?? undefined,
        updatedAt: row.updatedAt,
        fields: row.fields,
      };
    },
    ["page", key, databaseCacheNamespace],
    { revalidate: 60, tags: [cacheTags.pages, cacheTags.page(key)] },
  )();
}

export function getItems(collection: string) {
  return unstable_cache(
    async () => {
      const now = Date.now();
      const rows = await db
        .select()
        .from(items)
        .where(
          and(
            eq(items.collection, collection),
            eq(items.status, "published"),
            or(isNull(items.publishAt), lte(items.publishAt, now)),
          ),
        )
        .orderBy(items.sortOrder);

      return rows.map((row) => ({
        id: row.id,
        collection: row.collection,
        slug: row.slug,
        status: row.status,
        sortOrder: row.sortOrder,
        publishAt: row.publishAt,
        updatedAt: row.updatedAt,
        fields: row.fields,
      }));
    },
    ["items", collection, databaseCacheNamespace],
    {
      revalidate: 60,
      tags: [cacheTags.items, cacheTags.collection(collection)],
    },
  )();
}

export function getRedirect(path: string) {
  return unstable_cache(
    async () => {
      const rows = await db
        .select()
        .from(redirects)
        .where(eq(redirects.source, path))
        .limit(1);
      return rows[0]?.destination ?? null;
    },
    ["redirect", path, databaseCacheNamespace],
    { revalidate: 60, tags: [cacheTags.redirects] },
  )();
}
