import { z } from "zod";

const rawApplicationFieldDefinitions = [
  {
    step: "Applicant",
    fields: [
      { name: "applicantName", label: "Applicant full name", type: "text" },
      { name: "dateOfBirth", label: "Date of birth", type: "date" },
      { name: "sex", label: "Sex", type: "text" },
      { name: "nationality", label: "Nationality", type: "text" },
      {
        name: "entryClass",
        label: "Entry class",
        type: "select",
        options: ["Senior One", "Senior Five"],
      },
      {
        name: "religion",
        label: "Religion (optional)",
        type: "text",
        optional: true,
      },
    ],
  },
  {
    step: "Previous school and results",
    fields: [
      { name: "previousSchool", label: "Previous school", type: "text" },
      { name: "schoolDistrict", label: "School district", type: "text" },
      {
        name: "completionYear",
        label: "Year of completion",
        type: "text",
        inputMode: "numeric",
      },
      {
        name: "pleIndexNumber",
        label: "PLE index number",
        type: "text",
        optional: true,
        entryClass: "Senior One",
      },
      {
        name: "pleAggregate",
        label: "PLE aggregate",
        type: "text",
        optional: true,
        entryClass: "Senior One",
      },
      {
        name: "uceIndexNumber",
        label: "UCE index number",
        type: "text",
        optional: true,
        entryClass: "Senior Five",
      },
      {
        name: "uceResults",
        label: "UCE results",
        type: "textarea",
        optional: true,
        entryClass: "Senior Five",
      },
      {
        name: "subjectPreferences",
        label: "Subject combination preferences",
        type: "textarea",
        optional: true,
        entryClass: "Senior Five",
      },
    ],
  },
  {
    step: "Parent or guardian",
    fields: [
      { name: "guardianName", label: "Parent or guardian name", type: "text" },
      {
        name: "guardianRelationship",
        label: "Relationship to applicant",
        type: "text",
      },
      { name: "guardianPhone", label: "Phone number", type: "tel" },
      {
        name: "guardianWhatsApp",
        label: "WhatsApp (optional)",
        type: "tel",
        optional: true,
      },
      { name: "guardianEmail", label: "Email address", type: "email" },
      {
        name: "residentialAddress",
        label: "Residential address",
        type: "textarea",
      },
    ],
  },
] as const;

export const applicationFieldDefinitions = rawApplicationFieldDefinitions.map(
  (group) => ({
    ...group,
    fields: group.fields.map((field) => ({
      ...field,
      needsConfirmation: true as const,
    })),
  }),
);

export const applicationDocumentDefinitions = [
  {
    name: "resultSlip",
    label: "PLE or UCE result slip",
    needsConfirmation: true,
  },
  {
    name: "identityDocument",
    label: "Birth certificate or identity document",
    needsConfirmation: true,
  },
  {
    name: "passportPhoto",
    label: "Passport photo",
    needsConfirmation: true,
  },
] as const;

const applicationFieldsBaseSchema = z.object({
  applicantName: z.string().trim().min(2).max(120),
  dateOfBirth: z.iso.date(),
  sex: z.string().trim().min(1).max(50),
  nationality: z.string().trim().min(2).max(80),
  entryClass: z.enum(["Senior One", "Senior Five"]),
  religion: z.string().trim().max(80),
  previousSchool: z.string().trim().min(2).max(160),
  schoolDistrict: z.string().trim().min(2).max(100),
  completionYear: z
    .string()
    .regex(/^\d{4}$/, "Enter the four-digit year of completion."),
  pleIndexNumber: z.string().trim().max(80),
  pleAggregate: z.string().trim().max(30),
  uceIndexNumber: z.string().trim().max(80),
  uceResults: z.string().trim().max(500),
  subjectPreferences: z.string().trim().max(300),
  guardianName: z.string().trim().min(2).max(120),
  guardianRelationship: z.string().trim().min(2).max(80),
  guardianPhone: z.string().trim().min(5).max(40),
  guardianWhatsApp: z.string().trim().max(40),
  guardianEmail: z.email().max(254),
  residentialAddress: z.string().trim().min(5).max(300),
  consent: z.literal(true, {
    error: "Please confirm the consent statement before continuing.",
  }),
});

export const applicationFieldsSchema = applicationFieldsBaseSchema.superRefine(
  (fields, context) => {
    const requiredByEntryClass =
      fields.entryClass === "Senior One"
        ? (["pleIndexNumber", "pleAggregate"] as const)
        : (["uceIndexNumber", "uceResults"] as const);

    for (const field of requiredByEntryClass) {
      if (!fields[field]) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "This field is required for the selected entry class.",
        });
      }
    }
  },
);

export type ApplicationFields = z.infer<typeof applicationFieldsSchema>;
export type ApplicationFieldName = keyof ApplicationFields;
export type ApplicationStatus =
  | "new"
  | "in_review"
  | "interview_invited"
  | "offer_made"
  | "declined"
  | "closed";
export type ApplicationDocumentName =
  (typeof applicationDocumentDefinitions)[number]["name"];

export const applicationStatusSchema = z.enum([
  "new",
  "in_review",
  "interview_invited",
  "offer_made",
  "declined",
  "closed",
]);

export const applicationFieldGroups = [
  {
    label: "Applicant",
    fields: [
      "applicantName",
      "dateOfBirth",
      "sex",
      "nationality",
      "entryClass",
      "religion",
    ],
  },
  {
    label: "Previous school and results",
    fields: [
      "previousSchool",
      "schoolDistrict",
      "completionYear",
      "pleIndexNumber",
      "pleAggregate",
      "uceIndexNumber",
      "uceResults",
      "subjectPreferences",
    ],
  },
  {
    label: "Parent or guardian",
    fields: [
      "guardianName",
      "guardianRelationship",
      "guardianPhone",
      "guardianWhatsApp",
      "guardianEmail",
      "residentialAddress",
    ],
  },
] as const;

export const applicationStepSchemas = [
  applicationFieldsBaseSchema.pick({
    applicantName: true,
    dateOfBirth: true,
    sex: true,
    nationality: true,
    entryClass: true,
    religion: true,
  }),
  applicationFieldsBaseSchema
    .pick({
      entryClass: true,
      previousSchool: true,
      schoolDistrict: true,
      completionYear: true,
      pleIndexNumber: true,
      pleAggregate: true,
      uceIndexNumber: true,
      uceResults: true,
      subjectPreferences: true,
    })
    .superRefine((fields, context) => {
      const requiredByEntryClass =
        fields.entryClass === "Senior One"
          ? (["pleIndexNumber", "pleAggregate"] as const)
          : (["uceIndexNumber", "uceResults"] as const);
      for (const field of requiredByEntryClass) {
        if (!fields[field]) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: "This field is required for the selected entry class.",
          });
        }
      }
    }),
  applicationFieldsBaseSchema.pick({
    guardianName: true,
    guardianRelationship: true,
    guardianPhone: true,
    guardianWhatsApp: true,
    guardianEmail: true,
    residentialAddress: true,
  }),
] as const;

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

export type ContactEnquiry = z.infer<typeof contactEnquirySchema>;
