import type { CollectionConfig } from "payload";
import { communicationsEditors, publishedOrAuthenticated } from "./access";
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
    create: communicationsEditors,
    update: communicationsEditors,
    delete: communicationsEditors,
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
    {
      name: "consentRecorded",
      type: "checkbox",
      defaultValue: false,
      label: "Consent recorded for people in these photos",
      admin: {
        position: "sidebar",
        description: "Do not publish an album of identifiable students without consent.",
      },
      validate: (value, { data }) => {
        const published =
          (data as { _status?: string; editorialStatus?: string } | undefined)
            ?._status === "published" ||
          (data as { editorialStatus?: string } | undefined)
            ?.editorialStatus === "published";
        if (published && !value) {
          return "Record consent before publishing this album.";
        }
        return true;
      },
    },
    editorialStatusField,
    publishedAtField,
  ],
};
