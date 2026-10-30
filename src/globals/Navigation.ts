import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";
import { isSafeHref } from "@/lib/links";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: { group: "Settings" },
  access: {
    read: anyone,
    update: contentEditors,
  },
  fields: [
    {
      name: "primary",
      type: "array",
      labels: { singular: "Main link", plural: "Main links" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true, validate: (value: unknown) => (typeof value === "string" && isSafeHref(value) ? true : "Use a relative path or an http(s), mailto or tel link.") },
        {
          name: "children",
          type: "array",
          labels: { singular: "Sub-link", plural: "Sub-links" },
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true, validate: (value: unknown) => (typeof value === "string" && isSafeHref(value) ? true : "Use a relative path or an http(s), mailto or tel link.") },
          ],
        },
      ],
    },
    {
      name: "footer",
      type: "array",
      labels: { singular: "Footer group", plural: "Footer groups" },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true, validate: (value: unknown) => (typeof value === "string" && isSafeHref(value) ? true : "Use a relative path or an http(s), mailto or tel link.") },
          ],
        },
      ],
    },
  ],
};
