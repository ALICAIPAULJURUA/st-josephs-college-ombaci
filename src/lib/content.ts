import { getPayload } from "payload";

import type {
  Media,
  Navigation,
  Page,
  SiteSetting,
} from "@/payload-types";
import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

async function getPayloadInstance() {
  const { default: payloadConfig } = await import("@payload-config");
  return getPayload({ config: payloadConfig });
}

export async function getSiteSettings(): Promise<SiteSetting | null> {
  const payload = await getPayloadInstance();

  return payload.findGlobal({
    slug: "site-settings",
    overrideAccess: false,
  });
}

export async function getNavigation(): Promise<Navigation | null> {
  const payload = await getPayloadInstance();

  return payload.findGlobal({
    slug: "navigation",
    overrideAccess: false,
  });
}

export async function getPage(slug: string): Promise<Page | null> {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });

  return result.docs[0] ?? null;
}

function mediaUrl(value: number | Media | null | undefined) {
  if (!value || typeof value === "number") {
    return undefined;
  }

  return value.url ?? undefined;
}

export function photoFromPageMedia(
  value: number | Media | null | undefined,
  fallback: { alt: string; label: string; tone: PhotoTone; ratio?: PhotoRatio },
) {
  const src = mediaUrl(value);

  return {
    ...fallback,
    src,
    alt: src ? (value as Media).alt ?? fallback.alt : fallback.alt,
    label: src ? fallback.label : fallback.label,
  };
}
