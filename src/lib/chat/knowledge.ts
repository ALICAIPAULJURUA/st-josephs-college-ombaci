import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";

import { db } from "@/db/client";
import { items, pages, settings } from "@/db/schema";

const pageRoutes: Record<string, string> = {
  about: "/about",
  admissions: "/admissions",
  requirements: "/admissions/requirements",
  fees: "/admissions/fees",
  "term-dates": "/admissions/term-dates",
  academics: "/academics",
  "o-level": "/academics/o-level",
  "a-level": "/academics/a-level",
  "study-resources": "/academics/study-resources",
  boarding: "/student-life/boarding",
  "student-life": "/student-life",
  clubs: "/student-life/clubs",
  sports: "/sports",
  "old-boys": "/old-boys",
  contact: "/contact",
};

const allowedCollections = {
  faqs: "/admissions/faqs",
  facilities: "/academics/study-resources",
  sports: "/sports",
  notices: "/notices",
} as const;

const contentFields = new Set([
  "title",
  "lead",
  "summary",
  "body",
  "question",
  "answer",
  "topic",
  "date",
  "eventDate",
  "startsOn",
  "expiresOn",
  "facts",
  "teamNotes",
]);

type KnowledgeInput = {
  pageRows: { key: string; fields: Record<string, unknown> }[];
  itemRows: {
    collection: string;
    slug: string;
    fields: Record<string, unknown>;
  }[];
  settingsRows: { key: string; value: unknown }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function plainText(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\[To be confirmed:[^\]]+\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contentLines(fields: Record<string, unknown>) {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!contentFields.has(key)) continue;
    if (typeof value === "string") {
      const text = plainText(value);
      if (text) lines.push(text);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") {
          const text = plainText(entry);
          if (text) lines.push(text);
        }
      }
    }
  }

  return lines;
}

export function compileAssistantKnowledge(input: KnowledgeInput) {
  const sections: string[] = [];

  for (const page of input.pageRows) {
    const route = pageRoutes[page.key];
    if (!route) continue;
    const lines = contentLines(page.fields);
    if (lines.length > 0) {
      sections.push(`${page.key} (${route})\n${lines.join("\n")}`);
    }
  }

  for (const item of input.itemRows) {
    const route =
      allowedCollections[
        item.collection as keyof typeof allowedCollections
      ];
    if (!route) continue;
    if (item.collection === "faqs" && item.fields.feedsAssistant !== true) {
      continue;
    }
    const lines = contentLines(item.fields);
    if (lines.length > 0) {
      sections.push(
        `${item.collection} (${route}, ${item.slug})\n${lines.join("\n")}`,
      );
    }
  }

  const siteSettings = Object.fromEntries(
    input.settingsRows.map((row) => [row.key, row.value]),
  );
  const contact = [
    typeof siteSettings.motto === "string" &&
    !siteSettings.motto.includes("[To be confirmed:")
      ? `School motto: ${plainText(siteSettings.motto)}`
      : "",
    typeof siteSettings.phone === "string" &&
    !siteSettings.phone.includes("[To be confirmed:")
      ? `School phone: ${plainText(siteSettings.phone)}`
      : "",
    typeof siteSettings.email === "string" &&
    !siteSettings.email.includes("[To be confirmed:")
      ? `School email: ${plainText(siteSettings.email)}`
      : "",
    typeof siteSettings.whatsappNumber === "string" &&
    siteSettings.whatsappNumber
      ? `School WhatsApp: ${plainText(siteSettings.whatsappNumber)}`
      : "",
    siteSettings.applicationsOpen === true
      ? "Applications are currently open."
      : "Applications are not currently open.",
    isRecord(siteSettings.notice) &&
    siteSettings.notice.enabled === true &&
    typeof siteSettings.notice.text === "string"
      ? `Current school notice: ${plainText(siteSettings.notice.text)}`
      : "",
  ].filter(Boolean);

  if (contact.length > 0) sections.push(`School information\n${contact.join("\n")}`);

  return [
    "KNOWLEDGE",
    "The following information is from published school website content. Missing or unconfirmed details are not known.",
    ...sections,
  ].join("\n\n");
}

export async function buildAssistantKnowledge(now = Date.now()) {
  const [pageRows, itemRows, settingsRows] = await Promise.all([
    db
      .select({ key: pages.key, fields: pages.fields })
      .from(pages)
      .where(and(eq(pages.status, "published"), inArray(pages.key, Object.keys(pageRoutes)))),
    db
      .select({
        collection: items.collection,
        slug: items.slug,
        fields: items.fields,
      })
      .from(items)
      .where(
        and(
          eq(items.status, "published"),
          inArray(items.collection, Object.keys(allowedCollections)),
          or(isNull(items.publishAt), lte(items.publishAt, now)),
        ),
      ),
    db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(
        inArray(settings.key, [
          "motto",
          "phone",
          "email",
          "whatsappNumber",
          "applicationsOpen",
          "notice",
        ]),
      ),
  ]);

  return compileAssistantKnowledge({ pageRows, itemRows, settingsRows });
}
