import { describe, expect, it } from "vitest";

import {
  applicationFieldsSchema,
  contactEnquirySchema,
} from "@/content/schemas/application-fields";

const validApplication = {
  studentFirstName: "Amina",
  studentLastName: "Example",
  dateOfBirth: "2012-04-15",
  gender: "Female",
  gradeApplyingFor: "Senior One",
  previousSchool: "Arua Primary School",
  guardianFirstName: "Guardian",
  guardianLastName: "Example",
  guardianOccupation: "",
  guardianAddress: "Arua City",
  emergencyContactName: "Emergency Contact",
  emergencyContactPhone: "+256700000000",
  emergencyContactRelationship: "Parent",
  medicalConditions: "",
  allergies: "",
  additionalNotes: "",
  guardianPhone: "+256700000000",
  guardianEmail: "guardian@example.test",
  consent: true,
};

describe("application fields", () => {
  it("accepts the requested application details and optional fields", () => {
    expect(applicationFieldsSchema.safeParse(validApplication).success).toBe(
      true,
    );
    const withoutOptionalDetails = applicationFieldsSchema.safeParse({
      ...validApplication,
      previousSchool: "",
      guardianOccupation: "",
      medicalConditions: "",
      allergies: "",
      additionalNotes: "",
    });
    expect(withoutOptionalDetails.success).toBe(true);
  });

  it("requires contact, emergency, date, grade, and consent details", () => {
    const missingRequiredDetails = applicationFieldsSchema.safeParse({
      ...validApplication,
      studentFirstName: "",
      emergencyContactPhone: "",
      consent: false,
    });
    expect(missingRequiredDetails.success).toBe(false);
    if (!missingRequiredDetails.success) {
      expect(missingRequiredDetails.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["studentFirstName"] }),
          expect.objectContaining({ path: ["emergencyContactPhone"] }),
          expect.objectContaining({ path: ["consent"] }),
        ]),
      );
    }

    expect(
      applicationFieldsSchema.safeParse({
        ...validApplication,
        gradeApplyingFor: "Senior Three",
      }).success,
    ).toBe(false);
  });

  it("validates the contact enquiry", () => {
    expect(
      contactEnquirySchema.safeParse({
        name: "Parent Example",
        email: "parent@example.test",
        phone: "",
        subject: "Admissions question",
        message: "Please share how to contact the admissions office.",
      }).success,
    ).toBe(true);
    expect(
      contactEnquirySchema.safeParse({
        name: "P",
        email: "not-an-email",
        phone: "",
        subject: "",
        message: "Short",
      }).success,
    ).toBe(false);
  });
});
