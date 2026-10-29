import type { CollectionConfig } from "payload";
import { contentEditors, publishedOrAuthenticated } from "./access";
import {
  contentHooks,
  contentVersions,
  editorialStatusField,
  mediaField,
  publishedAtField,
  richText,
  slugField,
} from "./shared";

export const OldBoys: CollectionConfig = {
  slug: "old-boys",
  labels: { singular: "Old Boy", plural: "Old Boys" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "classYear", "editorialStatus"],
    description:
      "Publish only after the Old Boy has agreed to appear and the school has confirmed the details.",
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
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "classYear", type: "text", label: "Class" },
    { name: "profession", type: "text" },
    { name: "quote", type: "textarea", maxLength: 320 },
    richText("bio", "Profile"),
    mediaField("photo", "Portrait"),
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
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
