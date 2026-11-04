import { z } from "zod";

const rawApplicationFieldDefinitions = [
  {
    label: "Student Information",
    description: "Please provide the student's personal details",
    fields: [
      {
        name: "studentFirstName",
        label: "First Name",
        type: "text",
        placeholder: "Enter first name",
      },
      {
        name: "studentLastName",
        label: "Last Name",
        type: "text",
        placeholder: "Enter last name",
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        placeholder: "dd/mm/yyyy",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        placeholder: "Select gender",
        options: ["Male", "Female"],
      },
    ],
  },
  {
    label: "Academic Information",
    description: "Grade and previous school details",
    fields: [
      {
        name: "gradeApplyingFor",
        label: "Grade Applying For",
        type: "select",
        placeholder: "Select a grade",
        options: ["Senior One", "Senior Five"],
      },
      {
        name: "previousSchool",
        label: "Previous School (if applicable)",
        type: "text",
        placeholder: "Enter previous school name",
        optional: true,
      },
    ],
  },
  {
    label: "Parent/Guardian Information",
    description: "Primary contact person details",
    fields: [
      {
        name: "guardianFirstName",
        label: "First Name",
        type: "text",
        placeholder: "Enter first name",
      },
      {
        name: "guardianLastName",
        label: "Last Name",
        type: "text",
        placeholder: "Enter last name",
      },
      {
        name: "guardianEmail",
        label: "Email Address",
        type: "email",
        placeholder: "parent@example.com",
      },
      {
        name: "guardianPhone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+256 XXX XXX XXX",
      },
      {
        name: "guardianAddress",
        label: "Address",
        type: "textarea",
        placeholder: "Enter full address",
      },
      {
        name: "guardianOccupation",
        label: "Occupation",
        type: "text",
        placeholder: "Enter occupation",
        optional: true,
      },
    ],
  },
  {
    label: "Emergency Contact",
    description: "Alternative contact in case of emergency",
    fields: [
      {
        name: "emergencyContactName",
        label: "Full Name",
        type: "text",
        placeholder: "Enter name",
      },
      {
        name: "emergencyContactPhone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+256 XXX XXX XXX",
      },
      {
        name: "emergencyContactRelationship",
        label: "Relationship",
        type: "text",
        placeholder: "e.g., Uncle, Aunt",
      },
    ],
  },
  {
    label: "Medical Information",
    description: "Health details for student care",
    fields: [
      {
        name: "medicalConditions",
        label: "Medical Conditions",
        type: "textarea",
        placeholder: "List any medical conditions we should be aware of",
        optional: true,
      },
      {
        name: "allergies",
        label: "Allergies",
        type: "textarea",
        placeholder: "List any allergies (food, medication, etc.)",
        optional: true,
      },
    ],
  },
  {
    label: "Additional Notes",
    description: "Any other information you'd like to share",
    fields: [
      {
        name: "additionalNotes",
        label: "Additional Notes",
        type: "textarea",
        placeholder: "Enter any additional information...",
        optional: true,
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
    name: "birthCertificate",
    label: "Birth Certificate",
    hint: "PDF, JPG, or PNG. Maximum 5 MB.",
    needsConfirmation: true,
  },
  {
    name: "previousReportCard",
    label: "Previous Report Card (if applicable)",
    hint: "PDF, JPG, or PNG. Maximum 5 MB.",
    needsConfirmation: true,
  },
  {
    name: "immunizationRecords",
    label: "Immunization Records",
    hint: "PDF, JPG, or PNG. Maximum 5 MB.",
    needsConfirmation: true,
  },
] as const;

export const applicationDocumentGroup = {
  label: "Required Documents",
  description: "Upload the following documents (PDF, JPG, PNG - Max 5MB each)",
} as const;

function requiredText(label: string, maximum: number, minimum = 1) {
  const requiredMessage = `Enter ${label}.`;
  return z
    .string({ error: requiredMessage })
    .trim()
    .min(minimum, requiredMessage)
    .max(maximum, `Keep ${label} to ${maximum} characters or fewer.`);
}

function optionalText(label: string, maximum: number) {
  return z
    .string({ error: `Enter ${label} as text.` })
    .trim()
    .max(maximum, `Keep ${label} to ${maximum} characters or fewer.`);
}

const applicationFieldsBaseSchema = z.object({
  studentFirstName: requiredText("the student's first name", 80),
  studentLastName: requiredText("the student's last name", 80),
  dateOfBirth: z.iso.date({ error: "Enter a valid date of birth." }),
  gender: z.enum(["Male", "Female"], { error: "Choose a gender." }),
  gradeApplyingFor: z.enum(["Senior One", "Senior Five"], {
    error: "Choose a grade.",
  }),
  previousSchool: optionalText("the previous school name", 160),
  guardianFirstName: requiredText("the parent's or guardian's first name", 80),
  guardianLastName: requiredText("the parent's or guardian's last name", 80),
  guardianOccupation: optionalText("the occupation", 120),
  guardianAddress: requiredText("a full address", 300, 5),
  emergencyContactName: requiredText(
    "the emergency contact's full name",
    160,
    2,
  ),
  emergencyContactPhone: requiredText(
    "the emergency contact's phone number",
    40,
    5,
  ),
  emergencyContactRelationship: requiredText(
    "the emergency contact's relationship",
    80,
    2,
  ),
  medicalConditions: optionalText("medical conditions", 2000),
  allergies: optionalText("allergies", 2000),
  additionalNotes: optionalText("additional notes", 2000),
  guardianPhone: requiredText("the parent's or guardian's phone number", 40, 5),
  guardianEmail: z
    .email({ error: "Enter a valid email address." })
    .max(254, "Email addresses must be 254 characters or fewer."),
  consent: z.literal(true, {
    error: "Please confirm the consent statement before continuing.",
  }),
});

export const applicationFieldsSchema = applicationFieldsBaseSchema;

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

export const applicationFieldGroups = applicationFieldDefinitions.map(
  (group) => ({
    label: group.label,
    fields: group.fields.map((field) => field.name),
  }),
);

export function applicationFieldLabel(name: string) {
  for (const group of applicationFieldDefinitions) {
    const field = group.fields.find((entry) => entry.name === name);
    if (field) return field.label;
  }
  return name.replaceAll(/([A-Z])/g, " $1");
}

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

export type ContactEnquiry = z.infer<typeof contactEnquirySchema>;
