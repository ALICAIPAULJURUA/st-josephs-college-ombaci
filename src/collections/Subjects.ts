import type { CollectionConfig } from "payload";
import { contentEditors, publishedOrAuthenticated } from "./access";
import {
  contentAdmin,
  contentHooks,
  contentVersions,
  editorialStatusField,
  publishedAtField,
  richText,
  slugField,
} from "./shared";

export const Subjects: CollectionConfig = {
  slug: "subjects",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "level", "editorialStatus"],
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
    {
      name: "level",
      type: "select",
      required: true,
      defaultValue: "both",
      options: [
        { label: "O Level", value: "o-level" },
        { label: "A Level", value: "a-level" },
        { label: "Both", value: "both" },
      ],
    },
    { name: "summary", type: "textarea", maxLength: 320 },
    richText("body", "Details"),
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
