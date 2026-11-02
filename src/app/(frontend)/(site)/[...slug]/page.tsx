import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  ContentTemplates,
  DetailTemplate,
} from "@/components/pages/ContentTemplates";
import { buildMetadata } from "@/lib/seo";
import { getCollectionSchema } from "@/content/schemas/collections";
import { getPageSchema } from "@/content/schemas/registry";
import {
  getContentItem,
  getContentItems,
  getPage,
  getRedirect,
  getSiteSettings,
} from "@/lib/content";
import { isSafeContentPath } from "@/lib/content-path";
import { getHomeData } from "@/lib/home";

type RouteParams = { slug: string[] };

function imageSource(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const source = (value as Record<string, unknown>).src;
  return typeof source === "string" && source ? source : undefined;
}

async function pageForRoute(route: string) {
  return getPage(route.replace(/^\/+|\/+$/g, ""));
}

function detailRoute(slug: readonly string[]) {
  if (
    slug.length === 2 &&
    ["news", "sports", "achievements"].includes(slug[0])
  ) {
    return { collection: slug[0], itemSlug: slug[1] };
  }
  if (slug.length === 3 && slug[0] === "old-boys" && slug[1] === "profiles") {
    return { collection: "old-boys", itemSlug: slug[2] };
  }
  if (slug.length === 2 && slug[0] === "old-boys") {
    return { collection: "old-boys", itemSlug: slug[1] };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = `/${slug.join("/")}`;
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    pageForRoute(route),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (page) {
    const seo = page.fields.seo;
    const seoFields =
      seo !== null && typeof seo === "object" && !Array.isArray(seo)
        ? (seo as Record<string, unknown>)
        : {};
    const title =
      typeof seoFields.title === "string" && seoFields.title
        ? seoFields.title
        : page.title;
    const rawDescription =
      typeof seoFields.description === "string" && seoFields.description
        ? seoFields.description
        : page.summary;
    const description =
      rawDescription?.slice(0, 160) ?? settings.metaDescription;
    return {
      ...buildMetadata({
        title,
        description,
        canonical: route,
        openGraphImage: imageSource(page.fields.heroImage) ?? settings.logo.src,
        siteName: settings.schoolName,
        siteUrl,
      }),
      ...(route === "/apply"
        ? { robots: { index: false, follow: false } }
        : {}),
      openGraph: {
        ...buildMetadata({
          title,
          description,
          canonical: route,
          openGraphImage:
            imageSource(page.fields.heroImage) ?? settings.logo.src,
          siteName: settings.schoolName,
          siteUrl,
        }).openGraph,
        type: "website",
      },
    };
  }

  const detail = detailRoute(slug);
  if (detail) {
    const item = await getContentItem(detail.collection, detail.itemSlug);
    if (item) {
      const title =
        typeof item.fields.title === "string"
          ? item.fields.title
          : typeof item.fields.name === "string"
            ? item.fields.name
            : "Details";
      const rawDescription =
        typeof item.fields.summary === "string"
          ? item.fields.summary
          : undefined;
      const description =
        rawDescription?.slice(0, 160) ?? settings.metaDescription;
      const image =
        imageSource(item.fields.photo) ??
        imageSource(item.fields.heroImage) ??
        settings.logo.src;
      const metadata = buildMetadata({
        title,
        description,
        canonical: route,
        openGraphImage: image,
        siteName: settings.schoolName,
        siteUrl,
      });
      return {
        ...metadata,
        openGraph: {
          ...metadata.openGraph,
          type: detail.collection === "news" ? "article" : "website",
        },
      };
    }
  }

  const extraPages = await getContentItems("extra-pages");
  const extraPage = extraPages.find((item) => item.fields.route === route);
  if (extraPage) {
    const title =
      typeof extraPage.fields.title === "string"
        ? extraPage.fields.title
        : "Information";
    const description =
      typeof extraPage.fields.summary === "string"
        ? extraPage.fields.summary.slice(0, 160)
        : undefined;
    return buildMetadata({
      title,
      description: description ?? settings.metaDescription,
      canonical: route,
      siteName: settings.schoolName,
      siteUrl,
    });
  }

  return {
    title: "Page not found",
    robots: { index: false, follow: false },
  };
}

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const path = slug.join("/");
  if (path === "404") notFound();

  const redirectTo = await getRedirect(`/${path}`);
  if (redirectTo) {
    if (!isSafeContentPath(redirectTo)) {
      throw new Error("A saved page redirect has an invalid destination.");
    }
    permanentRedirect(redirectTo);
  }

  const [page, home, settings] = await Promise.all([
    pageForRoute(path),
    getHomeData(),
    getSiteSettings(),
  ]);

  if (page) {
    const schema = getPageSchema(page.slug);
    if (!schema) notFound();

    const items = schema.collection
      ? await getContentItems(schema.collection)
      : [];
    return (
      <ContentTemplates
        admissions={home.admissions}
        items={items}
        page={page}
        schema={schema}
        searchQuery={
          typeof filters.q === "string" ? filters.q.slice(0, 100) : ""
        }
        settings={settings}
      />
    );
  }

  const detail = detailRoute(slug);
  if (detail) {
    const [item, schema] = await Promise.all([
      getContentItem(detail.collection, detail.itemSlug),
      Promise.resolve(getCollectionSchema(detail.collection)),
    ]);
    if (!item || !schema) notFound();

    return (
      <DetailTemplate
        admissions={home.admissions}
        item={item}
        schema={schema}
      />
    );
  }

  const extraPages = await getContentItems("extra-pages");
  const extraPage = extraPages.find((item) => item.fields.route === `/${path}`);
  const extraSchema = getCollectionSchema("extra-pages");
  if (extraPage && extraSchema) {
    return (
      <DetailTemplate
        admissions={home.admissions}
        item={extraPage}
        schema={{
          ...extraSchema,
          label:
            typeof extraPage.fields.title === "string"
              ? extraPage.fields.title
              : extraSchema.label,
          route: `/${path}`,
          template: "detail",
        }}
      />
    );
  }

  notFound();
}
