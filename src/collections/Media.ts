import path from "node:path";
import type { CollectionConfig } from "payload";
import { anyone, communicationsEditors } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["alt", "filename", "updatedAt"],
    description:
      "Every image needs alt text. Images showing students need a recorded consent note.",
  },
  access: {
    read: anyone,
    create: communicationsEditors,
    update: communicationsEditors,
    delete: communicationsEditors,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "public/media"),
    mimeTypes: ["image/*"],
    focalPoint: true,
    adminThumbnail: "thumbnail",
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined, position: "centre" },
      { name: "card", width: 960, height: undefined, position: "centre" },
      { name: "hero", width: 1920, height: undefined, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
      admin: {
        description: "Describe what the image shows for someone who cannot see it.",
      },
    },
    { name: "caption", type: "text", label: "Caption" },
    {
      name: "credit",
      type: "text",
      label: "Photographer or credit",
    },
    {
      name: "showsStudents",
      type: "checkbox",
      label: "Shows identifiable students",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "consentRecorded",
      type: "checkbox",
      label: "Consent recorded",
      defaultValue: false,
      admin: {
        position: "sidebar",
        condition: (data) => Boolean(data?.showsStudents),
        description: "Confirm the school holds consent for this use.",
      },
      validate: (value, { siblingData }) =>
        (siblingData as { showsStudents?: boolean } | undefined)?.showsStudents &&
        !value
          ? "Record consent before publishing an image of identifiable students."
          : true,
    },
    {
      name: "consentNote",
      type: "textarea",
      label: "Consent note",
      admin: {
        condition: (data) => Boolean(data?.showsStudents),
        description: "Where and when consent was recorded. Do not include private details.",
      },
    },
  ],
};
