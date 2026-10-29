import type { Access, CollectionConfig, Where } from "payload";
import { contentEditors } from "./access";
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

const publicNotices: Access = ({ req }) => {
  if (req.user) return true;
  const where: Where = {
    and: [
      { _status: { equals: "published" } },
      { expiresAt: { exists: false } },
    ],
  };
  return where;
};

export const Notices: CollectionConfig = {
  slug: "notices",
  admin: {
    ...contentAdmin,
    defaultColumns: ["title", "category", "editorialStatus", "expiresAt"],
  },
  access: {
    read: publicNotices,
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
    richText("body", "Notice"),
    mediaField("attachment", "Attachment"),
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Academic", value: "academic" },
        { label: "Admissions", value: "admissions" },
        { label: "Urgent", value: "urgent" },
      ],
    },
    {
      name: "pinned",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "expiresAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Leave blank for a notice that does not expire.",
      },
    },
    editorialStatusField,
    publishedAtField,
  ],
};
