import type { CollectionConfig } from "payload";
import { contentEditors, publishedOrAuthenticated } from "./access";
import {
  contentAdmin,
  contentHooks,
  contentVersions,
  editorialStatusField,
  mediaField,
  publishedAtField,
  richText,
  slugField,
} from "./shared";

export const Sports: CollectionConfig = {
  slug: "sports",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "season", "editorialStatus"],
  },
  access: {
    read: publishedOrAuthenticated,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  versions: contentVersions,
  hooks: contentHooks,
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    { name: "summary", type: "textarea", maxLength: 320 },
    richText("body", "Details"),
    mediaField("image", "Image"),
    {
      name: "season",
      type: "select",
      options: [
        { label: "Term one", value: "term-one" },
        { label: "Term two", value: "term-two" },
        { label: "Term three", value: "term-three" },
        { label: "All year", value: "all-year" },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
    editorialStatusField,
    publishedAtField,
  ],
};
