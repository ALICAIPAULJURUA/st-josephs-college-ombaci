import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";

export const HomeNumbers: GlobalConfig = {
  slug: "home-numbers",
  label: "Homepage numbers",
  admin: { group: "Homepage" },
  access: {
    read: anyone,
    update: contentEditors,
  },
  fields: [
    {
      name: "items",
      type: "array",
      labels: { singular: "Number", plural: "Numbers" },
      maxRows: 6,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
  ],
};
