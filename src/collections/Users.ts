import type { CollectionConfig } from "payload";
import { adminOnly, adminOrSelf, isAdminField } from "./access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "roles", "updatedAt"],
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: adminOrSelf,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      options: [
        { label: "Administrator", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Communications", value: "communications" },
        { label: "Admissions", value: "admissions" },
      ],
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description:
          "Editors manage all content. Communications manage news, notices, events and images. Admissions manage applications and enquiries.",
      },
    },
  ],
};
