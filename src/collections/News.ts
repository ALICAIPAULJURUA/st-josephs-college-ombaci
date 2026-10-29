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
  seoField,
  slugField,
} from "./shared";

export const News: CollectionConfig = {
  slug: "news",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "category", "editorialStatus", "publishedAt"],
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
    { name: "summary", type: "textarea", required: true, maxLength: 320 },
    richText("body", "Story"),
    mediaField("coverImage", "Cover image"),
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "school",
      options: [
        { label: "School news", value: "school" },
        { label: "Academic", value: "academic" },
        { label: "Sports", value: "sports" },
        { label: "Old Boys", value: "old-boys" },
        { label: "Faith", value: "faith" },
      ],
    },
    { name: "authorName", type: "text", label: "Byline" },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    seoField,
    editorialStatusField,
    publishedAtField,
  ],
};
