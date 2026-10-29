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

export const Albums: CollectionConfig = {
  slug: "albums",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "date", "editorialStatus"],
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
    mediaField("coverImage", "Cover image"),
    {
      name: "date",
      type: "date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    richText("body", "Introduction"),
    {
      name: "images",
      type: "array",
      fields: [
        mediaField("image", "Image"),
        { name: "caption", type: "text" },
      ],
    },
    editorialStatusField,
    publishedAtField,
  ],
};
