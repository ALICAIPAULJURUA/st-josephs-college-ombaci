import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

import { sampleMedia } from "../../src/content/defaults/sample-media";
import { E2E_USERS } from "./constants";

async function signIn(page: Page, role: keyof typeof E2E_USERS) {
  const user = E2E_USERS[role];
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("administrator can sign in and open staff accounts", async ({ page }) => {
  await signIn(page, "admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("sample photos to replace")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Questions we could not answer" }),
  ).toBeVisible();
  await expect(
    page.getByText("E2E sample question for the assistant dashboard."),
  ).toBeVisible();
  for (const sample of sampleMedia) {
    await expect(
      page.locator(".admin-sample-list").getByText(sample.alt),
    ).toBeVisible();
  }
  await expect(
    page.getByText("Laboratory glassware with a test tube held above a bowl", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Users" }).click();
  await expect(
    page.getByRole("heading", { name: "Staff accounts" }),
  ).toBeVisible();
  await expect(page.getByText(E2E_USERS.editor.email)).toBeVisible();

  const email = `phase-c-created-${Date.now()}@example.test`;
  const createForm = page.locator(".admin-form-card");
  await createForm.locator('input[name="email"]').fill(email);
  await createForm
    .locator('input[name="password"]')
    .fill("new-e2e-account-password");
  await createForm.locator('select[name="role"]').selectOption("editor");
  await createForm.getByRole("button", { name: "Add account" }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test("admin pages fit the reference widths without horizontal scrolling", async ({
  page,
}) => {
  await signIn(page, "admin");
  await expect(page).toHaveURL(/\/admin$/);
  await mkdir("test-results/screenshots", { recursive: true });

  for (const width of [1440, 1024, 820, 640, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/admin", "/admin/media", "/admin/users"]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(
        page.getByRole("complementary", {
          name: "School office navigation",
        }),
      ).toBeVisible();
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
      const name = route.slice(1).replaceAll("/", "-");
      await page.screenshot({
        path: `test-results/screenshots/${name}-${width}.png`,
        caret: "initial",
      });
    }
  }
});

test("page editors fit every reference width without horizontal scrolling", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page, "admin");
  await expect(page).toHaveURL(/\/admin$/);

  for (const width of [1440, 1024, 820, 640, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/admin/pages",
      "/admin/pages/home",
      "/admin/settings",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("complementary", {
          name: "School office navigation",
        }),
      ).toBeVisible();
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
      const name = route.slice(1).replaceAll("/", "-");
      await page.screenshot({
        path: `test-results/screenshots/${name}-${width}.png`,
        caret: "initial",
      });
    }
  }
});

test("editor cannot open staff accounts", async ({ page }) => {
  await signIn(page, "editor");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Welcome to the school office" }),
  ).toBeVisible();
});

test("admissions role is limited to applications and enquiries", async ({
  page,
}) => {
  await signIn(page, "admissions");
  await expect(page).toHaveURL(/\/admin\/applications$/);
  await expect(
    page.getByRole("heading", { name: "Admissions applications" }),
  ).toBeVisible();
  await page.goto("/admin/media");
  await expect(page).toHaveURL(/\/admin\/applications$/);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin\/applications$/);
  await page.setViewportSize({ width: 375, height: 800 });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("mobile navigation exposes the remaining content lists", async ({
  page,
}) => {
  await signIn(page, "editor");
  await expect(page).toHaveURL(/\/admin$/);
  await page.setViewportSize({ width: 375, height: 800 });

  const quickNavigation = page.getByRole("navigation", {
    name: "Quick navigation",
  });
  await quickNavigation.getByText("More").click();
  await quickNavigation.getByRole("link", { name: "Extra pages" }).click();

  await expect(page).toHaveURL(/\/admin\/extra-pages$/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Extra pages" }),
  ).toBeVisible();
});

test("staff can upload and remove a photo from the library", async ({
  page,
}) => {
  await signIn(page, "editor");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/media");
  await expect(page).toHaveURL(/\/admin\/media$/);
  const altText = `Playwright test photo ${Date.now()}`;
  const image = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: { r: 12, g: 38, b: 79 },
    },
  })
    .png()
    .toBuffer();

  await page.locator('input[name="file"]').setInputFiles({
    name: "phase-c-e2e.png",
    mimeType: "image/png",
    buffer: image,
  });
  await page.locator('.admin-upload-card input[name="alt"]').fill(altText);
  await page.getByRole("button", { name: "Upload photo" }).click();
  const photo = page.locator(".admin-media-card").filter({
    has: page.locator(`input[name="alt"][value="${altText}"]`),
  });
  await expect(photo).toBeVisible();
  await expect(photo.locator('input[name="alt"]')).toHaveValue(altText);

  page.once("dialog", (dialog) => dialog.accept());
  await photo.getByRole("button", { name: "Remove" }).click();
  await expect(photo).toHaveCount(0, { timeout: 15_000 });
});

test("staff can reorder page lists and edit a page draft", async ({ page }) => {
  await signIn(page, "editor");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/pages/home");
  await expect(
    page.getByRole("heading", { name: "Edit home page" }),
  ).toBeVisible();

  const panels = page
    .locator(".admin-editor-list")
    .filter({ hasText: "Home page panels" });
  const panelItems = panels.locator(".admin-editor-list-item");
  await expect(panelItems).toHaveCount(6);
  const firstPanelLabel = panelItems.nth(0).locator("input").first();
  const secondPanelLabel = panelItems.nth(1).locator("input").first();
  await expect(firstPanelLabel).toHaveValue("Study");
  await page
    .getByRole("button", { name: "Move Home page panels 2 up" })
    .click();
  await expect(firstPanelLabel).toHaveValue("Students");
  await expect(secondPanelLabel).toHaveValue("Study");

  const heading = page
    .locator(".admin-editor-fields > fieldset.admin-editor-group")
    .first()
    .locator("input")
    .first();
  const originalHeading = await heading.inputValue();
  await heading.fill(`${originalHeading} draft one`);
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByText("Unsaved changes")).toHaveCount(0);
  await expect(page.locator(".admin-editor-sticky-status")).toContainText(
    "Published",
  );

  const publicPage = await page.context().newPage();
  await publicPage.goto("/");
  await expect(publicPage.getByRole("heading", { level: 1 })).toContainText(
    "First among equals.",
  );
  await publicPage.close();

  await heading.fill(`${originalHeading} draft two`);
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved.")).toBeVisible();
  const earlierVersion = page.locator(".admin-revision-item").nth(1);
  await earlierVersion.locator("summary").click();
  await expect(earlierVersion).toContainText(`${originalHeading} draft one`);
  await earlierVersion
    .getByRole("button", { name: "Restore this version" })
    .click();
  await expect(page).toHaveURL(/notice=restored/);
  await expect(heading).toHaveValue(`${originalHeading} draft one`);
  await expect(
    page.getByText("This earlier version is now a draft.", { exact: false }),
  ).toBeVisible();
});
