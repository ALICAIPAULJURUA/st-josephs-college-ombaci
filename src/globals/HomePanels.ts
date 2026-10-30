import type { GlobalConfig } from "payload";
import { anyone, contentEditors } from "../collections/access";
import { mediaField } from "../collections/shared";
import { isSafeHref } from "@/lib/links";

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
        { name: "href", type: "text", required: true, validate: (value: unknown) => (typeof value === "string" && isSafeHref(value) ? true : "Use a relative path or an http(s), mailto or tel link.") },
        { name: "description", type: "textarea", required: true, maxLength: 220 },
        mediaField("image", "Image"),
      ],
    },
  ],
};
