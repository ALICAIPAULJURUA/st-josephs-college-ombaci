import type { MetadataRoute } from "next";
import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";

import { collectionSchemas } from "@/content/schemas/collections";
import { pageSchemas } from "@/content/schemas/registry";
import { db } from "@/db/client";
import { items, pages } from "@/db/schema";
import { contentItemPath } from "@/lib/content-path";
import { siteOrigin } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();
  const [publishedPages, publishedItems] = await Promise.all([
    db
      .select({
        key: pages.key,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(
        and(
          inArray(
            pages.key,
            pageSchemas
              .filter((schema) => schema.key !== "settings")
              .map((schema) => schema.key),
          ),
          eq(pages.status, "published"),
        ),
      ),
    db
      .select({
        collection: items.collection,
        slug: items.slug,
        fields: items.fields,
        updatedAt: items.updatedAt,
      })
      .from(items)
      .where(
        and(
          inArray(items.collection, [
            ...collectionSchemas.map((schema) => schema.key),
            "extra-pages",
          ]),
          eq(items.status, "published"),
          or(isNull(items.publishAt), lte(items.publishAt, now)),
        ),
      ),
  ]);
  const origin = siteOrigin();
  const routes = new Map<string, number>();

  for (const page of publishedPages) {
    if (page.key === "settings") continue;
    const schema = pageSchemas.find((entry) => entry.key === page.key);
    if (schema) routes.set(schema.route, page.updatedAt);
  }

  for (const item of publishedItems) {
    const route = contentItemPath(item.collection, item.slug, item.fields);
    if (route) routes.set(route, item.updatedAt);
  }

  return [...routes.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([route, updatedAt]) => ({
      url: new URL(route, `${origin}/`).toString(),
      lastModified: new Date(updatedAt),
    }));
}
