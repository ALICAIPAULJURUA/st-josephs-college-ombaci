import type { Metadata } from "next";

const SITE_NAME = "St. Joseph's College, Ombaci";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function buildMetadata({
  title,
  description,
  canonical,
  openGraphImage,
}: {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  openGraphImage?: string | null;
} = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const resolvedCanonical = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return {
    title: pageTitle,
    description: description ?? undefined,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: resolvedCanonical },
    openGraph: {
      title: pageTitle,
      description: description ?? undefined,
      siteName: SITE_NAME,
      url: resolvedCanonical,
      images: openGraphImage ? [{ url: openGraphImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description ?? undefined,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}
