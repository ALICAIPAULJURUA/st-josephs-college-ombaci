import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  Field,
} from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const slugField = (source = "title"): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "Used in the page address. Lowercase words separated by hyphens.",
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        if (typeof value === "string" && value.trim()) return slugify(value);
        const sourceValue = siblingData?.[source];
        return typeof sourceValue === "string" ? slugify(sourceValue) : value;
      },
    ],
  },
});

export const richText = (
  name: string,
  label: string,
  description?: string,
): Field => ({
  name,
  type: "richText",
  label,
  editor: lexicalEditor(),
  admin: description ? { description } : undefined,
});

export const mediaField = (
  name: string,
  label: string,
  description?: string,
): Field => ({
  name,
  type: "upload",
  relationTo: "media",
  label,
  admin: description ? { description } : undefined,
});

export const seoField: Field = {
  name: "seo",
  type: "group",
  label: "Search listing",
  admin: {
    description:
      "Optional. Leave blank to use the page title and summary.",
    position: "sidebar",
  },
  fields: [
    { name: "title", type: "text", label: "Title" },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      maxLength: 180,
    },
    mediaField("image", "Sharing image"),
  ],
};

export const editorialStatusField: Field = {
  name: "editorialStatus",
  type: "select",
  required: true,
  defaultValue: "draft",
  index: true,
  options: [
    { label: "Draft", value: "draft" },
    { label: "Review", value: "review" },
    { label: "Published", value: "published" },
  ],
  admin: {
    position: "sidebar",
    description:
      "Draft is private. Review is ready for a second pair of eyes. Published makes the item live.",
  },
};

export const publishedAtField: Field = {
  name: "publishedAt",
  type: "date",
  admin: {
    position: "sidebar",
    readOnly: true,
    date: { pickerAppearance: "dayAndTime" },
  },
};

export const syncEditorialStatus: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  if (!("editorialStatus" in data) && !("editorialStatus" in originalDoc)) {
    return data;
  }

  const next = { ...data };
  const status = next._status ?? originalDoc?._status;
  const editorial = next.editorialStatus ?? originalDoc?.editorialStatus;

  if (status === "published" && editorial !== "published") {
    next.editorialStatus = "published";
  } else if (editorial === "published" && status !== "published") {
    next._status = "published";
  } else if (editorial !== "published" && status === "published") {
    next._status = "draft";
  }

  if (next._status === "published" && !next.publishedAt) {
    next.publishedAt = new Date().toISOString();
  }

  return next;
};

export const contentVersions: CollectionConfig["versions"] = {
  drafts: {
    autosave: true,
    schedulePublish: true,
  },
  maxPerDoc: 20,
};

export const contentHooks: CollectionConfig["hooks"] = {
  beforeChange: [syncEditorialStatus],
};

export const contentAdmin: CollectionConfig["admin"] = {
  useAsTitle: "title",
  defaultColumns: ["title", "editorialStatus", "updatedAt"],
};
