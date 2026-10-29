import { expect, test } from "@playwright/test";

test("mobile menu opens, closes and exposes child links", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await expect(page.getByRole("link", { name: "History" })).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "History" })).toBeHidden();
});

test("desktop dropdown opens on hover and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const about = page.getByRole("link", { name: "About", exact: true });
  await about.hover();
  await about.focus();
  await expect(page.getByRole("link", { name: "History" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "History" })).toBeHidden();
});

test("notice bar dismisses", async ({ page }) => {
  await page.goto("/design");

  const notice = page.getByText("Design route preview", { exact: false });
  await expect(notice).toBeVisible();

  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(notice).toBeHidden();
});
