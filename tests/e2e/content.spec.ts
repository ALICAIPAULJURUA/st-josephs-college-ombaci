import { expect, test, type Page } from "@playwright/test";
import { E2E_USERS } from "./constants";

async function signInAsEditor(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(E2E_USERS.editor.email);
  await page.getByLabel("Password").fill(E2E_USERS.editor.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("history lists only the verified 1943 and 1960 milestones", async ({
  page,
}) => {
  await page.goto("/about/history");

  await expect(
    page.getByRole("heading", { name: "A history of learning" }),
  ).toBeVisible();
  await expect(page.getByText("1943", { exact: true })).toBeVisible();
  await expect(page.getByText("1960", { exact: true })).toBeVisible();
  await expect(page.getByText(/1981/)).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toBeVisible();
});

test("collection lists filter and keep hidden drafts private", async ({
  page,
}) => {
  await page.goto("/academics/o-level");
  await page
    .getByRole("searchbox", { name: "Filter o-level subjects" })
    .fill("A-level");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByText("[To be confirmed: current O-level subjects]"),
  ).toHaveCount(0);

  await page.goto("/news");
  await expect(
    page.getByText("There are no news articles to show right now."),
  ).toBeVisible();
  await expect(page.getByText(/DRAFT/)).toHaveCount(0);
});

test("detail routes show content and page sharing actions", async ({
  page,
}) => {
  await page.goto("/sports/rugby");

  await expect(page.getByRole("heading", { name: "Rugby" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy page link" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Share on WhatsApp" }),
  ).toBeVisible();
});

test("unknown routes use the editable not-found content", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Helpful pages" })
      .getByRole("link", { name: "Admissions", exact: true }),
  ).toHaveAttribute("href", "/admissions");
});

test("the Section 8 public routes render", async ({ page }) => {
  test.setTimeout(120_000);
  const routes = [
    "/about",
    "/about/history",
    "/about/leadership",
    "/admissions",
    "/admissions/requirements",
    "/admissions/fees",
    "/admissions/term-dates",
    "/admissions/faqs",
    "/apply",
    "/academics",
    "/academics/o-level",
    "/academics/a-level",
    "/academics/study-resources",
    "/student-life",
    "/student-life/boarding",
    "/student-life/clubs",
    "/sports",
    "/staff",
    "/achievements",
    "/old-boys",
    "/old-boys/profiles",
    "/news",
    "/notices",
    "/events",
    "/gallery",
    "/contact",
    "/privacy",
    "/terms",
    "/accessibility",
  ];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} should render`).toBe(200);
    await expect(
      page.locator("main h1"),
      `${route} should have one page title`,
    ).toHaveCount(1);
  }
});

test("publishing a sample story under a new address redirects its old address", async ({
  page,
}) => {
  await signInAsEditor(page);
  await page.goto("/admin/news");
  const article = page
    .locator("tr")
    .filter({ hasText: "Sample news item — regional science fair" });
  const editLink = article.getByRole("link", { name: "Edit" });
  await editLink.click();
  await expect(page).toHaveURL(/\/admin\/news\/.+$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Edit entry" })).toBeVisible();
  await page
    .getByLabel("Web address ending")
    .fill("regional-science-result-updated");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Changes published.")).toBeVisible();

  const response = await page.goto("/news/science-fair-region-2025-draft");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/news\/regional-science-result-updated$/);
  await expect(
    page.getByRole("heading", {
      name: "Sample news item — regional science fair",
    }),
  ).toBeVisible();
});

test("publishing an inner-page field updates the public page", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) =>
    pageErrors.push(error.stack ?? error.message),
  );
  await signInAsEditor(page);
  await page.goto("/admin/pages/history");
  await expect(
    page.getByRole("heading", { name: "Edit history" }),
  ).toBeVisible();
  const titleField = page.getByLabel("Page title");
  const originalTitle = await titleField.inputValue();
  await titleField.fill("History at Ombaci");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Changes published.")).toBeVisible();
  expect(pageErrors).toEqual([]);

  const response = await page.goto("/about/history");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "History at Ombaci" }),
  ).toBeVisible();

  await page.goto("/admin/pages/history");
  await page.getByLabel("Page title").fill(originalTitle);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Changes published.")).toBeVisible();
});

test("inner pages do not overflow at the approved viewport widths", async ({
  page,
}) => {
  for (const width of [1440, 1024, 820, 640, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about/history");
    await expect(
      page.getByRole("heading", { name: "A history of learning" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `history should not overflow at ${width}px`,
    ).toBe(true);
  }
});
