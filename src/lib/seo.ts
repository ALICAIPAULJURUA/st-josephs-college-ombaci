import type { Metadata } from "next";

export function buildMetadata({
  title,
  description,
  canonical,
  openGraphImage,
  siteName,
  siteUrl,
}: {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  openGraphImage?: string | null;
  siteName?: string;
  siteUrl?: string;
} = {}): Metadata {
  const name = siteName ?? "St. Joseph's College, Ombaci";
  const baseUrl =
    siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageTitle = title ?? name;
  const brandedTitle = title ? `${title} | ${name}` : name;
  const resolvedCanonical = canonical
    ? new URL(canonical, baseUrl).toString()
    : baseUrl;
  const image = openGraphImage ?? "/crest.png";

  return {
    title: pageTitle,
    description: description ?? undefined,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: canonical ?? "/" },
    openGraph: {
      title: brandedTitle,
      description: description ?? undefined,
      siteName: name,
      url: resolvedCanonical,
      images: [{ url: image, alt: `${name} crest` }],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description: description ?? undefined,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}
