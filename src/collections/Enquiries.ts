import type { CollectionConfig } from "payload";
import { admissionsTeam, anyone, isAdmissionsField } from "./access";

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "subject", "status", "createdAt"],
  },
  access: {
    read: admissionsTeam,
    create: anyone,
    update: admissionsTeam,
    delete: admissionsTeam,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true, maxLength: 4000 },
    {
      name: "consent",
      type: "checkbox",
      required: true,
      label: "I agree that the school may reply to this enquiry.",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Read", value: "read" },
        { label: "Replied", value: "replied" },
        { label: "Closed", value: "closed" },
      ],
      access: {
        create: isAdmissionsField,
        update: isAdmissionsField,
      },
      admin: { position: "sidebar" },
    },
    {
      name: "internalNotes",
      type: "textarea",
      access: {
        read: isAdmissionsField,
        update: isAdmissionsField,
      },
    },
  ],
};
