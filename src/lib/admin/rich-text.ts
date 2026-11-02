import sanitizeHtml from "sanitize-html";

import type { Field } from "@/content/schemas";

const allowedTags = [
  "p",
  "br",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "figure",
  "figcaption",
];
const allowedPasteTags = [
  "p",
  "br",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "blockquote",
];

const allowedAttributes = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

function sanitize(html: string, tags: readonly string[]) {
  return sanitizeHtml(html, {
    allowedTags: [...tags],
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a(tagName, attributes) {
        let isExternalWebAddress = false;
        try {
          const parsed = new URL(attributes.href ?? "");
          isExternalWebAddress =
            parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          isExternalWebAddress = false;
        }

        const { target, ...rest } = attributes;
        return {
          tagName,
          attribs: {
            ...rest,
            ...(isExternalWebAddress
              ? {
                  rel: "noopener noreferrer",
                  ...(target === "_blank" ? { target } : {}),
                }
              : target === "_blank"
                ? { target }
                : {}),
          },
        };
      },
    },
  });
}

export function sanitizeRichText(html: string) {
  return sanitize(html, allowedTags);
}

export function sanitizeRichTextPaste(html: string) {
  return sanitize(html, allowedPasteTags);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function sanitizeRichTextFields(
  fields: readonly Field[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned = { ...values };

  for (const field of fields) {
    const value = cleaned[field.name];
    if (field.type === "richtext" && typeof value === "string") {
      cleaned[field.name] = sanitizeRichText(value);
    } else if (field.type === "group" && isRecord(value)) {
      cleaned[field.name] = sanitizeRichTextFields(field.fields, value);
    } else if (
      field.type === "list" &&
      "itemFields" in field &&
      Array.isArray(value)
    ) {
      cleaned[field.name] = value.map((item) =>
        isRecord(item) ? sanitizeRichTextFields(field.itemFields, item) : item,
      );
    }
  }

  return cleaned;
}
