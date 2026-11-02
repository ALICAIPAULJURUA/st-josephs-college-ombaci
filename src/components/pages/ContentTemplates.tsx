import Link from "next/link";

import type { ContentItem, Page } from "@/lib/content";
import type { SiteSettings } from "@/content/defaults/site";
import type { PageSchema } from "@/content/schemas";
import { getPageSchemaByRoute } from "@/content/schemas/registry";
import type { HomeData } from "@/lib/home";
import { sanitizeRichText } from "@/lib/admin/rich-text";
import { contentItemPath } from "@/lib/content-path";
import { isSafeContentPath } from "@/lib/content-path";
import { ApplyBand } from "@/components/home/ApplyBand";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd, siteOrigin } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/PageHero";
import { SitePhoto } from "@/components/ui/SitePhoto";
import { ContactContent } from "./ContactContent";
import { PublicClientFeature } from "./PublicClientFeature";
import type { PhotoRatio, PhotoTone } from "@/components/ui/SitePhoto";

type Values = Record<string, unknown>;

const tones = ["navy", "navy-2", "green", "tint", "mist", "white"] as const;
const ratios = ["4/3", "3/4", "16/9", "1/1", "3/2", "4/5"] as const;

function isRecord(value: unknown): value is Values {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function photoProps(value: unknown, altFallback: string) {
  const photo = isRecord(value) ? value : {};
  const tone: PhotoTone = tones.find((item) => item === photo.tone) ?? "navy-2";
  const ratio: PhotoRatio | undefined = ratios.find(
    (item) => item === photo.ratio,
  );

  return {
    ...(typeof photo.src === "string" && photo.src ? { src: photo.src } : {}),
    alt: stringValue(photo.alt, altFallback),
    label: stringValue(photo.label, altFallback),
    tone,
    ...(ratio ? { ratio } : {}),
  };
}

function pageBreadcrumbs(schema: PageSchema, title: string) {
  const segments = schema.route.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
  ];
  let currentRoute = "";

  for (const [index, segment] of segments.entries()) {
    currentRoute += `/${segment}`;
    if (index === segments.length - 1) {
      crumbs.push({ label: title });
      continue;
    }

    const parent = getPageSchemaByRoute(currentRoute);
    crumbs.push({
      label: parent?.label ?? segment.replaceAll("-", " "),
      href: currentRoute,
    });
  }

  return crumbs;
}

function schemaDate(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      value,
    )
  ) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function detailStructuredData(
  item: ContentItem,
  schema: PageSchema,
  title: string,
) {
  const origin = siteOrigin();
  const route =
    schema.key === "events"
      ? `${schema.route}#${item.slug}`
      : contentItemPath(item.collection, item.slug, item.fields);
  if (!route) return null;

  const summary = itemSummary(item.fields);
  const image = photoProps(itemPhoto(item.fields), title).src;
  const base = {
    "@context": "https://schema.org",
    name: title,
    description: summary || undefined,
    url: new URL(route, `${origin}/`).toString(),
  };

  if (schema.key === "news") {
    return {
      ...base,
      "@type": "NewsArticle",
      headline: title,
      ...(image ? { image: new URL(image, `${origin}/`).toString() } : {}),
      ...(schemaDate(item.fields.date)
        ? { datePublished: schemaDate(item.fields.date) }
        : {}),
      publisher: {
        "@type": "Organization",
        name: "St. Joseph's College, Ombaci",
        logo: {
          "@type": "ImageObject",
          url: new URL("/crest.png", `${origin}/`).toString(),
        },
      },
      mainEntityOfPage: new URL(route, `${origin}/`).toString(),
    };
  }

  if (schema.key === "events") {
    return {
      ...base,
      "@type": "Event",
      ...(schemaDate(item.fields.eventDate)
        ? { startDate: schemaDate(item.fields.eventDate) }
        : {}),
    };
  }

  return null;
}

function safeContent(value: unknown) {
  return sanitizeRichText(stringValue(value));
}

function RichText({ value }: { value: unknown }) {
  const html = safeContent(value);
  if (!html) return null;

  return (
    <div className="prose-school" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function itemTitle(fields: Values) {
  return stringValue(
    fields.title,
    stringValue(fields.name, stringValue(fields.question, "More information")),
  );
}

function itemSummary(fields: Values) {
  return stringValue(fields.summary, stringValue(fields.bio));
}

function itemPhoto(fields: Values) {
  const firstCollectionPhoto =
    Array.isArray(fields.photos) && isRecord(fields.photos[0])
      ? fields.photos[0].photo
      : undefined;
  return photoProps(fields.photo ?? firstCollectionPhoto, itemTitle(fields));
}

function itemHref(collection: string | undefined, slug: string) {
  return collection
    ? (contentItemPath(collection, slug) ?? undefined)
    : undefined;
}

function ListFilter({ label, query }: { label: string; query: string }) {
  return (
    <form
      className="mb-8 flex flex-wrap items-end gap-3 border-b-2 border-line pb-6"
      role="search"
    >
      <label className="grid gap-2 font-semibold" htmlFor="content-filter">
        Filter {label.toLowerCase()}
        <input
          className="min-h-12 min-w-64 border-2 border-navy bg-white px-3 text-ink"
          defaultValue={query}
          id="content-filter"
          name="q"
          type="search"
        />
      </label>
      <button
        className="min-h-12 border-[3px] border-navy bg-yellow px-5 font-bold uppercase text-navy hover:bg-white"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}

function TimelineContent({
  items,
  emptyMessage,
}: {
  items: readonly ContentItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="mt-8">{emptyMessage}</p>;
  }

  return (
    <ol className="mt-10 border-l-4 border-navy">
      {items.map((item) => (
        <li
          className="relative grid gap-6 border-b-2 border-line py-7 pl-7 md:grid-cols-[minmax(120px,0.3fr)_minmax(0,1fr)]"
          key={item.id}
        >
          <span className="font-display text-[48px] font-black leading-none text-red">
            {stringValue(item.fields.year)}
          </span>
          <div>
            <h2 className="text-[clamp(28px,4vw,42px)] leading-[0.95]">
              {itemTitle(item.fields)}
            </h2>
            <p className="mt-3 leading-[1.5]">{itemSummary(item.fields)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ListingContent({
  schema,
  page,
  items,
  query,
}: {
  schema: PageSchema;
  page: Page;
  items: readonly ContentItem[];
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems =
    schema.key === "o-level"
      ? items.filter((item) => item.fields.level === "o-level")
      : schema.key === "a-level"
        ? items.filter((item) => item.fields.level === "a-level")
        : items;
  const matchingItems = normalizedQuery
    ? filteredItems.filter((item) =>
        [
          itemTitle(item.fields),
          itemSummary(item.fields),
          stringValue(item.fields.category),
          stringValue(item.fields.level),
          stringValue(item.fields.eventDate),
        ].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
    : filteredItems;
  const emptyMessage = stringValue(
    page.fields.emptyMessage,
    "There are no entries to show right now.",
  );

  if (schema.collection === "faqs") {
    return (
      <section
        aria-label="Questions and answers"
        className="mx-auto max-w-[1000px] px-10 py-10 max-[821px]:px-5"
      >
        <ListFilter label={schema.label} query={query} />
        {matchingItems.length === 0 ? <p>{emptyMessage}</p> : null}
        {matchingItems.map((item) => (
          <details className="border-b-2 border-line py-5" key={item.id}>
            <summary className="cursor-pointer font-bold text-navy">
              {stringValue(item.fields.question, itemTitle(item.fields))}
            </summary>
            <RichText value={item.fields.answer} />
          </details>
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label={schema.label}
      className="mx-auto max-w-[1320px] px-10 py-12 max-[821px]:px-5"
    >
      <ListFilter label={schema.label} query={query} />
      {matchingItems.length === 0 ? (
        <p className="py-2 text-[17px]">{emptyMessage}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matchingItems.map((item, index) => {
          const href = itemHref(schema.collection, item.slug);
          const title = itemTitle(item.fields);
          const image = itemPhoto(item.fields);

          return (
            <article className="border-t-[3px] border-navy" key={item.id}>
              {schema.collection !== "subjects" ? (
                <SitePhoto
                  {...image}
                  minHeight={180}
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : null}
              <div className="py-5">
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-navy-2">
                  {[
                    stringValue(item.fields.category),
                    stringValue(item.fields.level),
                    stringValue(item.fields.eventDate),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h2 className="text-[clamp(28px,4vw,42px)] leading-[0.95]">
                  {href ? (
                    <Link className="hover:underline" href={href}>
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </h2>
                {itemSummary(item.fields) ? (
                  <p className="mt-3 leading-[1.5]">
                    {itemSummary(item.fields)}
                  </p>
                ) : null}
                {item.fields.isSample === true ? (
                  <p className="mt-3 text-sm font-bold uppercase">
                    Example album
                  </p>
                ) : null}
                {schema.collection === "achievements" &&
                typeof item.fields.year === "number" ? (
                  <p className="mt-3 font-bold text-red">{item.fields.year}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ResourcesContent({
  items,
  emptyMessage,
}: {
  items: readonly ContentItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <p className="mx-auto max-w-[1320px] px-10 py-12 max-[821px]:px-5">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-10 py-10 max-[821px]:px-5">
      {items.map((item, index) => (
        <article
          className="grid gap-8 border-t-2 border-line py-8 md:grid-cols-2"
          key={item.id}
        >
          <SitePhoto
            {...itemPhoto(item.fields)}
            priority={index === 0}
            ratio="4/3"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="flex items-start gap-5">
            <span className="font-display text-[64px] font-black leading-none text-navy-2">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-[clamp(32px,5vw,56px)] leading-[0.92]">
                {itemTitle(item.fields)}
              </h2>
              {itemSummary(item.fields) ? (
                <p className="mt-3">{itemSummary(item.fields)}</p>
              ) : null}
              <RichText value={item.fields.body} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ContentTemplates({
  schema,
  page,
  items,
  settings,
  admissions,
  searchQuery = "",
}: {
  schema: PageSchema;
  page: Page;
  items: readonly ContentItem[];
  settings: SiteSettings;
  admissions: HomeData["admissions"];
  searchQuery?: string;
}) {
  const title = stringValue(page.fields.title, page.title);
  const lead = stringValue(page.fields.lead, page.summary);
  const structuredEvents =
    schema.key === "events"
      ? items.flatMap((item) => {
          const eventData = detailStructuredData(
            item,
            schema,
            itemTitle(item.fields),
          );
          return eventData ? [{ id: item.id, data: eventData }] : [];
        })
      : [];

  return (
    <>
      {structuredEvents.map((event) => (
        <JsonLd data={event.data} key={event.id} />
      ))}
      <PageHero label={schema.label} title={title} lead={lead} />
      <Breadcrumbs items={pageBreadcrumbs(schema, title)} />
      {schema.template === "story" ? (
        <section className="mx-auto grid max-w-[1320px] gap-8 px-10 py-10 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] max-[821px]:px-5">
          <SitePhoto
            {...photoProps(page.fields.heroImage, title)}
            priority
            ratio="4/3"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <RichText value={page.fields.body} />
        </section>
      ) : null}
      {schema.template === "info" ? (
        <section className="mx-auto max-w-[1320px] px-10 py-10 max-[821px]:px-5">
          {Array.isArray(page.fields.contents) &&
          page.fields.contents.length > 0 ? (
            <aside className="mb-8 border-l-4 border-yellow bg-mist p-5">
              <h2 className="mb-2 text-[28px]">On this page</h2>
              <ul className="list-inside list-disc">
                {page.fields.contents.map((entry, index) =>
                  isRecord(entry) ? (
                    <li key={`${stringValue(entry.title)}-${index}`}>
                      {stringValue(entry.title)}
                      {stringValue(entry.body)
                        ? ` — ${stringValue(entry.body)}`
                        : ""}
                    </li>
                  ) : null,
                )}
              </ul>
            </aside>
          ) : null}
          <div className="max-w-[900px]">
            <RichText value={page.fields.body} />
          </div>
          {schema.key === "not-found" && Array.isArray(page.fields.links) ? (
            <nav
              aria-label="Helpful pages"
              className="mt-8 flex flex-wrap gap-3"
            >
              {page.fields.links.map((entry, index) => {
                if (!isRecord(entry)) return null;
                const href = stringValue(entry.href);
                if (!isSafeContentPath(href)) return null;

                return (
                  <Link
                    className="border-[3px] border-navy bg-yellow px-5 py-3 font-bold uppercase text-navy hover:bg-white"
                    href={href}
                    key={`${href}-${index}`}
                  >
                    {stringValue(entry.label, href)}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          {schema.collection === "timeline" ? (
            <TimelineContent
              emptyMessage={stringValue(
                page.fields.emptyMessage,
                "There are no history entries to show right now.",
              )}
              items={items}
            />
          ) : null}
          {schema.key === "term-dates" ? (
            <TermDates settings={settings} />
          ) : null}
          {schema.key === "apply" && !settings.applicationsOpen ? (
            <div className="mt-8 border-l-4 border-yellow bg-mist p-5">
              {stringValue(page.fields.closedMessage)}
              <p className="mt-3">
                <Link className="font-bold underline" href="/contact">
                  Contact the school
                </Link>
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
      {schema.key === "apply" && settings.applicationsOpen ? (
        <PublicClientFeature
          feature="application"
          consentHtml={safeContent(page.fields.consentText)}
          siteKey={process.env.TURNSTILE_SITE_KEY ?? ""}
        />
      ) : null}
      {schema.template === "resources" ? (
        <ResourcesContent
          emptyMessage={stringValue(
            page.fields.emptyMessage,
            "There are no study resources to show right now.",
          )}
          items={items}
        />
      ) : null}
      {schema.template === "listing" ? (
        <ListingContent
          items={items}
          page={page}
          query={searchQuery}
          schema={schema}
        />
      ) : null}
      {schema.template === "contact" ? (
        <ContactContent
          formIntro={stringValue(page.fields.formIntro)}
          settings={settings}
        />
      ) : null}
      {schema.route !== "/apply" ? <ApplyBand data={admissions} /> : null}
    </>
  );
}

function TermDates({ settings }: { settings: SiteSettings }) {
  const dates = settings.termDates;
  if (!Array.isArray(dates) || dates.length === 0) {
    return (
      <p className="mt-8">
        Sample calendar not supplied. Contact the school for current term dates.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-navy text-white">
          <tr>
            <th className="p-3" scope="col">
              Term
            </th>
            <th className="p-3" scope="col">
              Opens
            </th>
            <th className="p-3" scope="col">
              Closes
            </th>
          </tr>
        </thead>
        <tbody>
          {dates.map((entry, index) =>
            isRecord(entry) ? (
              <tr
                className="border-b border-line"
                key={`${stringValue(entry.term)}-${index}`}
              >
                <th className="p-3" scope="row">
                  {stringValue(entry.term)}
                </th>
                <td className="p-3">{stringValue(entry.opens)}</td>
                <td className="p-3">{stringValue(entry.closes)}</td>
              </tr>
            ) : null,
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DetailTemplate({
  item,
  schema,
  admissions,
}: {
  item: ContentItem;
  schema: PageSchema;
  admissions: HomeData["admissions"];
}) {
  const fields = item.fields;
  const title = itemTitle(fields);
  const date = stringValue(fields.date, stringValue(fields.eventDate));
  const body = fields.body ?? fields.bio ?? fields.answer;
  const photos = Array.isArray(fields.photos)
    ? fields.photos.flatMap((entry) =>
        isRecord(entry) && isRecord(entry.photo)
          ? [photoProps(entry.photo, title)]
          : [],
      )
    : [];
  const structuredData = detailStructuredData(item, schema, title);

  return (
    <>
      {structuredData ? <JsonLd data={structuredData} /> : null}
      <PageHero label={schema.label} title={title} lead={itemSummary(fields)} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: schema.label, href: schema.route },
          { label: title },
        ]}
      />
      <article className="mx-auto grid max-w-[1320px] gap-8 px-10 py-10 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] max-[821px]:px-5">
        <SitePhoto
          {...itemPhoto(fields)}
          priority
          ratio="4/3"
          sizes="(max-width: 768px) 100vw, 40vw"
        />
        <div>
          {date ? <p className="mb-3 font-semibold">{date}</p> : null}
          {typeof fields.year === "number" ? (
            <p className="mb-3 font-display text-[48px] font-black text-red">
              {fields.year}
            </p>
          ) : null}
          <RichText value={body} />
          {typeof fields.source === "object" && isRecord(fields.source) ? (
            <p className="mt-6">
              <a
                className="font-semibold underline"
                href={stringValue(fields.source.href)}
                rel="noopener noreferrer"
                target="_blank"
              >
                {stringValue(fields.source.label, "Read the source")}
              </a>
            </p>
          ) : null}
          <PublicClientFeature feature="share" title={title} />
        </div>
      </article>
      {photos.length > 0 ? (
        <section
          aria-label="Album photos"
          className="mx-auto grid max-w-[1320px] grid-cols-1 gap-5 px-10 pb-12 sm:grid-cols-2 lg:grid-cols-3 max-[821px]:px-5"
        >
          {photos.map((photo, index) => (
            <SitePhoto
              {...photo}
              key={`${photo.label}-${index}`}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ))}
        </section>
      ) : null}
      <ApplyBand data={admissions} />
    </>
  );
}
