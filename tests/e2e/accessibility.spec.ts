import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { E2E_USERS } from "./constants";

const publicTemplates = [
  "/",
  "/about",
  "/admissions",
  "/news",
  "/academics/study-resources",
  "/contact",
  "/sports/rugby",
];

test("public page templates meet WCAG 2.2 AA checks", async ({ page }) => {
  const violations: {
    route: string;
    id: string;
    impact: string | null | undefined;
    targets: string[];
  }[] = [];

  for (const route of publicTemplates) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    violations.push(
      ...results.violations.map((violation) => ({
        route,
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => JSON.stringify(node.target)),
      })),
    );
  }

  expect(violations).toEqual([]);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const mobileResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    mobileResults.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => JSON.stringify(node.target)),
    })),
  ).toEqual([]);
});

test("admin dashboard meets WCAG 2.2 AA checks", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(E2E_USERS.admin.email);
  await page.getByLabel("Password").fill(E2E_USERS.admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => JSON.stringify(node.target)),
    })),
  ).toEqual([]);
});

test("reduced motion preference disables decorative motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("auto");
  await expect
    .poll(() =>
      page
        .locator(".apply-ring")
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
});
