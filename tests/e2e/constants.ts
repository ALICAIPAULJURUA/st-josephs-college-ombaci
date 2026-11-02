export const E2E_BASE_URL = "http://localhost:3187";
export const E2E_DATABASE_URL = "file:./data/site-e2e.db";
export const E2E_SESSION_SECRET =
  "phase-c-playwright-only-session-secret-not-for-deployment";
export const E2E_USERS = {
  admin: {
    email: "phase-c-admin@example.test",
    password: "e2e-admin-password-12",
  },
  editor: {
    email: "phase-c-editor@example.test",
    password: "e2e-editor-password-12",
  },
  admissions: {
    email: "phase-c-admissions@example.test",
    password: "e2e-admissions-password-12",
  },
} as const;
