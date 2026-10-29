import type { CollectionConfig } from "payload";
import { contentEditors, publishedOrAuthenticated } from "./access";
import {
  contentAdmin,
  contentHooks,
  contentVersions,
  editorialStatusField,
  publishedAtField,
  richText,
} from "./shared";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: {
    ...contentAdmin,
    useAsTitle: "question",
    defaultColumns: ["question", "category", "editorialStatus"],
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
    { name: "question", type: "text", required: true },
    richText("answer", "Answer"),
    {
      name: "category",
      type: "select",
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Admissions", value: "admissions" },
        { label: "Boarding", value: "boarding" },
        { label: "Academics", value: "academics" },
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
