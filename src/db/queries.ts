import { unstable_cache } from "next/cache";

import { db } from "./client";
import { items, pages, settings } from "./schema";

export const getSettings = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const rows = await db.select().from(settings);
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value as string);
      } catch {
        result[row.key] = row.value;
      }
    }
    return result;
  },
  ["settings"],
  { tags: ["settings"] },
);

export const getPage = unstable_cache(
  async (key: string) => {
    const row = await db.select().from(pages).where(({ key: k }) => k.equals(key)).limit(1);

    if (!row[0]) return null;

    let fields: unknown = {};
    try {
      fields = JSON.parse(row[0].fields as string);
    } catch {
      fields = row[0].fields;
    }

    return {
      key: row[0].key,
      status: row[0].status,
      updatedBy: row[0].updatedBy ?? undefined,
      updatedAt: row[0].updatedAt,
      fields,
    };
  },
  ["page"],
  { tags: ["page"] },
);

export const getItems = unstable_cache(
  async (collection: string) => {
    const rows = await db
      .select()
      .from(items)
      .where(({ collection: c }) => c.equals(collection))
      .orderBy(items.sortOrder);

    return rows.map((row) => {
      let fields: unknown = {};
      try {
        fields = JSON.parse(row.fields as string);
      } catch {
        fields = row.fields;
      }
      return {
        id: row.id,
        collection: row.collection,
        slug: row.slug,
        status: row.status,
        sortOrder: row.sortOrder,
        publishAt: row.publishAt,
        updatedAt: row.updatedAt,
        fields,
      };
    });
  },
  ["items"],
  { tags: ["collection"] },
);
