import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";
import { mediaField } from "../collections/shared";

export const HomePanels: GlobalConfig = {
  slug: "home-panels",
  label: "Homepage panels",
  admin: { group: "Homepage" },
  access: {
    read: anyone,
    update: contentEditors,
  },
  fields: [
    {
      name: "panels",
      type: "array",
      labels: { singular: "Panel", plural: "Panels" },
      maxRows: 8,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "description", type: "textarea", required: true, maxLength: 220 },
        mediaField("image", "Image"),
      ],
    },
  ],
};
