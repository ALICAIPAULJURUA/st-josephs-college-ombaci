import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

import {
  E2E_BASE_URL,
  E2E_SESSION_SECRET,
  E2E_USERS,
} from "./tests/e2e/constants";

const e2eDatabaseUrl = `pglite:./data/site-e2e-${randomUUID()}`;
const e2ePrivateStorageDirectory = `./data/private-applications-e2e-${randomUUID()}`;
process.env.E2E_DATABASE_URL = e2eDatabaseUrl;
process.env.E2E_PRIVATE_STORAGE_DIR = e2ePrivateStorageDirectory;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node --import tsx tests/e2e/start-web-server.ts",
    cwd: process.cwd(),
    url: E2E_BASE_URL,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: e2eDatabaseUrl,
      E2E_DATABASE_URL: e2eDatabaseUrl,
      E2E_PRIVATE_STORAGE_DIR: e2ePrivateStorageDirectory,
      APPLICATION_PRIVATE_STORAGE_DIR: e2ePrivateStorageDirectory,
      SESSION_SECRET: E2E_SESSION_SECRET,
      SEED_ADMIN_EMAIL: E2E_USERS.admin.email,
      SEED_ADMIN_PASSWORD: E2E_USERS.admin.password,
      STORAGE_DRIVER: "local",
      OPENROUTER_API_KEY: "playwright-test-key-not-for-deployment",
      OPENROUTER_MODEL: "openai/gpt-4o-mini",
      TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      EMAIL_API_KEY: "playwright-test-email-key-not-for-deployment",
      EMAIL_FROM: "St. Joseph's College <noreply@example.test>",
      ADMISSIONS_EMAIL: "admissions@example.test",
      NODE_ENV: "development",
    },
  },
});
