import { settingsDefaults, type SiteSettings } from "@/content/defaults/site";
import { buildValidator } from "@/content/schemas";
import { getCollectionSchema } from "@/content/schemas/collections";
import {
  getPageSchema,
  getPageSchemaByRoute,
} from "@/content/schemas/registry";
import { settingsSchema } from "@/content/schemas/settings";
import {
  getItems as getPublishedItems,
  getPage as getPublishedPage,
  getRedirect,
  getSettings,
} from "@/db/queries";
import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

export type { Navigation, SiteSettings } from "@/content/defaults/site";
export type Page = {
  slug: string;
  title: string;
  summary?: string;
  fields: Record<string, unknown>;
};

export type ContentItem = {
  id: string;
  collection: string;
  slug: string;
  fields: Record<string, unknown>;
};

export { getRedirect };
export { contentItemPath } from "@/lib/content-path";

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = buildValidator(settingsSchema).safeParse({
    ...settingsDefaults,
    ...(await getSettings()),
  });
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`The published site settings are invalid: ${issues}`);
  }

  return result.data;
}

export async function getNavigation(): Promise<SiteSettings["navigation"]> {
  return (await getSiteSettings()).navigation;
}

export async function getPage(slug: string): Promise<Page | null> {
  const schema =
    getPageSchemaByRoute(`/${slug.replace(/^\/+|\/+$/g, "")}`) ??
    getPageSchema(slug);
  if (!schema) return null;

  const page = await getPublishedPage(schema.key);
  if (!page) return null;
  const validation = buildValidator(schema).safeParse(page.fields);
  if (!validation.success) {
    const issues = validation.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`The published ${schema.label} page is invalid: ${issues}`);
  }
  const fields: Record<string, unknown> = Object.assign({}, validation.data);
  const title = fields.title;
  if (typeof title !== "string") return null;
  const summary =
    typeof fields.lead === "string"
      ? fields.lead
      : typeof fields.summary === "string"
        ? fields.summary
        : undefined;
  return {
    slug: schema.key,
    title,
    ...(summary ? { summary } : {}),
    fields,
  };
}

export async function getContentItems(
  collection: string,
): Promise<ContentItem[]> {
  const schema = getCollectionSchema(collection);
  if (!schema) throw new Error(`The ${collection} list is not configured.`);

  const items = await getPublishedItems(collection);
  return items.map((item) => {
    const validation = buildValidator(schema).safeParse(item.fields);
    if (!validation.success) {
      const issues = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(
        `The published ${schema.label} entry "${item.slug}" is invalid: ${issues}`,
      );
    }

    return {
      id: item.id,
      collection,
      slug: item.slug,
      fields: validation.data,
    };
  });
}

export async function getContentItem(
  collection: string,
  slug: string,
): Promise<ContentItem | null> {
  const items = await getContentItems(collection);
  return items.find((item) => item.slug === slug) ?? null;
}

type MediaValue = {
  url?: string | null;
  alt?: string | null;
};

function mediaUrl(value: number | MediaValue | null | undefined) {
  if (!value || typeof value === "number") {
    return undefined;
  }

  return value.url ?? undefined;
}

export function photoFromPageMedia(
  value: number | MediaValue | null | undefined,
  fallback: { alt: string; label: string; tone: PhotoTone; ratio?: PhotoRatio },
) {
  const src = mediaUrl(value);
  const alt =
    src && typeof value === "object" && value !== null
      ? (value.alt ?? fallback.alt)
      : fallback.alt;

  return {
    ...fallback,
    src,
    alt,
    label: src ? fallback.label : fallback.label,
  };
}
