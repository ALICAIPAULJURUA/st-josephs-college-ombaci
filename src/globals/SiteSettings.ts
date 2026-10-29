import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";
import { mediaField } from "../collections/shared";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "School details",
  admin: { group: "Settings" },
  access: {
    read: anyone,
    update: contentEditors,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identity",
          fields: [
            {
              name: "schoolName",
              type: "text",
              required: true,
              defaultValue: "St. Joseph's College, Ombaci",
            },
            {
              name: "motto",
              type: "text",
              defaultValue: "Primus inter pares",
            },
            mediaField("logo", "School logo"),
            {
              name: "metaTitle",
              type: "text",
              defaultValue: "St. Joseph's College, Ombaci",
            },
            {
              name: "metaDescription",
              type: "textarea",
              maxLength: 180,
              defaultValue:
                "A Catholic boys' boarding school in Arua City, West Nile, Uganda.",
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            { name: "address", type: "textarea" },
            { name: "city", type: "text" },
            { name: "district", type: "text" },
            { name: "country", type: "text", defaultValue: "Uganda" },
            { name: "phone", type: "text" },
            { name: "email", type: "email" },
            {
              name: "whatsappNumber",
              type: "text",
              label: "WhatsApp number",
              admin: {
                description:
                  "International format without the plus sign, for example 256770911635.",
              },
            },
            {
              name: "whatsappMessage",
              type: "text",
              label: "WhatsApp opening message",
              defaultValue:
                "Hello St. Joseph's College, Ombaci. I would like to ask about admissions.",
            },
            { name: "officeHours", type: "text" },
            {
              name: "coordinates",
              type: "group",
              fields: [
                { name: "latitude", type: "number" },
                { name: "longitude", type: "number" },
              ],
            },
          ],
        },
        {
          label: "Admissions",
          fields: [
            {
              name: "admissions",
              type: "group",
              fields: [
                {
                  name: "open",
                  type: "checkbox",
                  defaultValue: false,
                  label: "Applications are open",
                },
                {
                  name: "opensAt",
                  type: "date",
                  admin: { date: { pickerAppearance: "dayOnly" } },
                },
                {
                  name: "closesAt",
                  type: "date",
                  admin: { date: { pickerAppearance: "dayOnly" } },
                },
                { name: "note", type: "textarea" },
              ],
            },
            {
              name: "termDates",
              type: "array",
              labels: { singular: "Term", plural: "Term dates" },
              fields: [
                { name: "name", type: "text", required: true },
                {
                  name: "startsAt",
                  type: "date",
                  admin: { date: { pickerAppearance: "dayOnly" } },
                },
                {
                  name: "endsAt",
                  type: "date",
                  admin: { date: { pickerAppearance: "dayOnly" } },
                },
              ],
            },
          ],
        },
        {
          label: "Links",
          fields: [
            {
              name: "socialLinks",
              type: "array",
              fields: [
                {
                  name: "platform",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Facebook", value: "facebook" },
                    { label: "Instagram", value: "instagram" },
                    { label: "X", value: "x" },
                    { label: "YouTube", value: "youtube" },
                    { label: "LinkedIn", value: "linkedin" },
                  ],
                },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
