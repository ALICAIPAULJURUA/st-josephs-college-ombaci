import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";

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
        { name: "href", type: "text", required: true },
        {
          name: "children",
          type: "array",
          labels: { singular: "Sub-link", plural: "Sub-links" },
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
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
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
