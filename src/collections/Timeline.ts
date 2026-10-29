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
} from "./shared";

export const Timeline: CollectionConfig = {
  slug: "timeline",
  admin: {
    ...contentAdmin,
    defaultColumns: ["year", "title", "editorialStatus"],
    description:
      "Do not add the disputed 1981 history. Use only dates confirmed by the school.",
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
    { name: "year", type: "number", required: true, min: 1943, max: 2100 },
    richText("body", "Description"),
    mediaField("image", "Image"),
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
