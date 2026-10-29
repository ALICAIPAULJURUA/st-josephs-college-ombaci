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

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "startDate", "editorialStatus"],
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
      name: "startDate",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
      validate: (value, { siblingData }) => {
        const startDate = (siblingData as { startDate?: string } | undefined)
          ?.startDate;
        if (!value || !startDate) return true;
        return new Date(value) >= new Date(startDate)
          ? true
          : "The end must be after the start.";
      },
    },
    { name: "allDay", type: "checkbox", defaultValue: false },
    { name: "location", type: "text" },
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
