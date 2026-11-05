import { describe, expect, it } from "vitest";

import { isApplicationSubmissionConfigured } from "@/lib/admissions/readiness";

const developmentEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  TURNSTILE_SITE_KEY: "test-site-key",
  TURNSTILE_SECRET_KEY: "test-secret-key",
  EMAIL_API_KEY: "test-email-key",
  EMAIL_FROM: "School <noreply@example.test>",
  ADMISSIONS_EMAIL: "admissions@example.test",
  SESSION_SECRET: "a-test-session-secret-with-at-least-32-chars",
};

describe("application submission readiness", () => {
  it("is ready when local security, email, and session settings exist", () => {
    expect(isApplicationSubmissionConfigured(developmentEnvironment)).toBe(
      true,
    );
  });

  it("is not ready when required provider settings are missing", () => {
    expect(
      isApplicationSubmissionConfigured({
        ...developmentEnvironment,
        TURNSTILE_SECRET_KEY: "",
      }),
    ).toBe(false);
    expect(
      isApplicationSubmissionConfigured({
        ...developmentEnvironment,
        ADMISSIONS_EMAIL: "not-an-email",
      }),
    ).toBe(false);
    expect(
      isApplicationSubmissionConfigured({
        ...developmentEnvironment,
        SESSION_SECRET: "short",
      }),
    ).toBe(false);
  });

  it("requires explicit persistent database and private file storage in production", () => {
    const productionEnvironment: NodeJS.ProcessEnv = {
      ...developmentEnvironment,
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://school.example",
      APPLICATION_PRIVATE_STORAGE_DIR: "/var/private/applications",
    };

    expect(isApplicationSubmissionConfigured(productionEnvironment)).toBe(true);
    expect(
      isApplicationSubmissionConfigured({
        ...productionEnvironment,
        DATABASE_URL: "",
      }),
    ).toBe(false);
    expect(
      isApplicationSubmissionConfigured({
        ...productionEnvironment,
        DATABASE_URL: "pglite:./data/postgres",
      }),
    ).toBe(false);
    expect(
      isApplicationSubmissionConfigured({
        ...productionEnvironment,
        APPLICATION_PRIVATE_STORAGE_DIR: "",
      }),
    ).toBe(false);
  });
});
