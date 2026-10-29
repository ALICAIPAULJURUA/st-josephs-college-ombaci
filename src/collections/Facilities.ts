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

export const Facilities: CollectionConfig = {
  slug: "facilities",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "category", "editorialStatus"],
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
      name: "category",
      type: "select",
      defaultValue: "learning",
      options: [
        { label: "Learning", value: "learning" },
        { label: "Boarding", value: "boarding" },
        { label: "Sport", value: "sport" },
        { label: "Faith", value: "faith" },
        { label: "Grounds", value: "grounds" },
      ],
    },
    {
      name: "features",
      type: "array",
      label: "At a glance",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
    seoField,
    editorialStatusField,
    publishedAtField,
  ],
};
