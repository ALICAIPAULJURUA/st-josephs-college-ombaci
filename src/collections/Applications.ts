import type { CollectionConfig } from "payload";
import {
  admissionsTeam,
  anyone,
  isAdmissionsField,
} from "./access";

export const Applications: CollectionConfig = {
  slug: "applications",
  labels: { singular: "Application", plural: "Applications" },
  admin: {
    useAsTitle: "reference",
    defaultColumns: [
      "reference",
      "studentLastName",
      "admissionLevel",
      "status",
      "createdAt",
    ],
  },
  access: {
    read: admissionsTeam,
    create: anyone,
    update: admissionsTeam,
    delete: admissionsTeam,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== "create" || data.reference) return data;
        const year = new Date().getUTCFullYear();
        const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
        return { ...data, reference: `OMB-${year}-${suffix}` };
      },
    ],
  },
  fields: [
    {
      name: "reference",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Reviewing", value: "reviewing" },
        { label: "Shortlisted", value: "shortlisted" },
        { label: "Admitted", value: "admitted" },
        { label: "Declined", value: "declined" },
      ],
      access: {
        create: isAdmissionsField,
        update: isAdmissionsField,
      },
      admin: { position: "sidebar" },
    },
    {
      name: "submittedAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true, position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      type: "row",
      fields: [
        { name: "studentFirstName", type: "text", required: true, label: "Student first name" },
        { name: "studentLastName", type: "text", required: true, label: "Student last name" },
      ],
    },
    { name: "dateOfBirth", type: "date", label: "Date of birth" },
    { name: "currentSchool", type: "text", label: "Current or previous school" },
    {
      name: "admissionLevel",
      type: "select",
      required: true,
      label: "Applying for",
      options: [
        { label: "Senior One", value: "senior-one" },
        { label: "Senior Five", value: "senior-five" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "boarding",
      type: "select",
      options: [
        { label: "Boarding", value: "boarding" },
        { label: "Day", value: "day" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "guardianName", type: "text", required: true, label: "Parent or guardian" },
        { name: "guardianRelationship", type: "text", label: "Relationship to student" },
      ],
    },
    { name: "phone", type: "text", required: true },
    { name: "email", type: "email" },
    { name: "district", type: "text" },
    { name: "previousResults", type: "textarea", label: "Previous results" },
    { name: "notes", type: "textarea", label: "Anything else" },
    {
      name: "consent",
      type: "checkbox",
      required: true,
      label: "I confirm the information is accurate and may be used to process this application.",
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
