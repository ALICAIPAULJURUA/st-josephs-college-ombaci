import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

import { E2E_USERS } from "./constants";

test("content backup download includes content and excludes private records", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(E2E_USERS.admin.email);
  await page.getByLabel("Password").fill(E2E_USERS.admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download a backup of all content" })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^ombaci-content-backup-\d{4}-\d{2}-\d{2}\.json$/,
  );

  const path = await download.path();
  if (!path) throw new Error("The browser did not save the content backup.");
  const backup = JSON.parse(await readFile(path, "utf8")) as {
    formatVersion: number;
    contents: Record<string, unknown[]>;
    excluded: string[];
  };
  expect(backup.formatVersion).toBe(1);
  expect(backup.contents.pages.length).toBeGreaterThan(0);
  expect(backup.contents.media.length).toBeGreaterThan(0);
  expect(backup.excluded).toContain("User accounts and password hashes");
  expect(backup.contents).not.toHaveProperty("applications");
});

test("content backup rejects unauthenticated and non-admin users", async ({
  page,
}) => {
  const unauthenticated = await page.request.get("/api/admin/backup");
  expect(unauthenticated.status()).toBe(401);

  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(E2E_USERS.editor.email);
  await page.getByLabel("Password").fill(E2E_USERS.editor.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const forbidden = await page.request.get("/api/admin/backup");
  expect(forbidden.status()).toBe(403);
});
