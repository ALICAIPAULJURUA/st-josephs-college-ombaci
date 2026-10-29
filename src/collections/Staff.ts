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

export const Staff: CollectionConfig = {
  slug: "staff",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "department", "editorialStatus"],
    description:
      "Only publish a staff member after the school has confirmed their name, role and photograph.",
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
    { name: "role", type: "text", required: true },
    { name: "department", type: "text" },
    richText("bio", "Biography"),
    mediaField("photo", "Portrait"),
    { name: "email", type: "email" },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    editorialStatusField,
    publishedAtField,
  ],
};
