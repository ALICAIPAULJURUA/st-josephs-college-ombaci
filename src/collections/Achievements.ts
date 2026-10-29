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

export const Achievements: CollectionConfig = {
  slug: "achievements",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "year", "editorialStatus"],
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
    richText("body", "Details"),
    mediaField("image", "Image"),
    {
      name: "year",
      type: "number",
      required: true,
      min: 1943,
      max: 2100,
    },
    {
      name: "category",
      type: "select",
      defaultValue: "academic",
      options: [
        { label: "Academic", value: "academic" },
        { label: "Science", value: "science" },
        { label: "Sport", value: "sport" },
        { label: "Service", value: "service" },
      ],
    },
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
