import { describe, expect, it } from "vitest";

import {
  applicationFieldsSchema,
  applicationStepSchemas,
  contactEnquirySchema,
} from "@/content/schemas/application-fields";

const validApplication = {
  applicantName: "Amina Example",
  dateOfBirth: "2012-04-15",
  sex: "Female",
  nationality: "Ugandan",
  entryClass: "Senior One",
  religion: "",
  previousSchool: "Arua Primary School",
  schoolDistrict: "Arua",
  completionYear: "2025",
  pleIndexNumber: "PLE 123456",
  pleAggregate: "8",
  uceIndexNumber: "",
  uceResults: "",
  subjectPreferences: "",
  guardianName: "Guardian Example",
  guardianRelationship: "Parent",
  guardianPhone: "+256700000000",
  guardianWhatsApp: "",
  guardianEmail: "guardian@example.test",
  residentialAddress: "Arua City",
  consent: true,
};

describe("application fields", () => {
  it("requires PLE details for Senior One applications", () => {
    expect(applicationFieldsSchema.safeParse(validApplication).success).toBe(
      true,
    );
    const result = applicationFieldsSchema.safeParse({
      ...validApplication,
      pleIndexNumber: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ["pleIndexNumber"] }),
      );
    }
  });

  it("requires UCE details, but not PLE details, for Senior Five applications", () => {
    const seniorFive = {
      ...validApplication,
      entryClass: "Senior Five",
      pleIndexNumber: "",
      pleAggregate: "",
      uceIndexNumber: "UCE 654321",
      uceResults: "Division one",
    };
    expect(applicationFieldsSchema.safeParse(seniorFive).success).toBe(true);

    const missingResults = applicationFieldsSchema.safeParse({
      ...seniorFive,
      uceResults: "",
    });
    expect(missingResults.success).toBe(false);
    if (!missingResults.success) {
      expect(missingResults.error.issues).toContainEqual(
        expect.objectContaining({ path: ["uceResults"] }),
      );
    }
  });

  it("validates the matching application step and the contact enquiry", () => {
    expect(applicationStepSchemas[1].safeParse(validApplication).success).toBe(
      true,
    );
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
