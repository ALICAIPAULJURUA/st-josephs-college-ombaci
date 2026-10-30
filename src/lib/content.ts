import {
  defaultNavigation,
  defaultPages,
  siteSettings,
  type DefaultPage,
  type Navigation,
  type SiteSettings,
} from "@/content/defaults/site";
import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

export type { Navigation, SiteSettings };
export type Page = DefaultPage;

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getNavigation(): Promise<Navigation> {
  return defaultNavigation;
}

export async function getPage(slug: string): Promise<Page | null> {
  return defaultPages[slug] ?? null;
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

  return {
    ...fallback,
    src,
    alt: src ? (value as MediaValue).alt ?? fallback.alt : fallback.alt,
    label: src ? fallback.label : fallback.label,
  };
}
