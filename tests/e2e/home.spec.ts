import { expect, test } from "@playwright/test";

test("home shows the approved headline, numbers and admissions link", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "First among equals.",
    }),
  ).toBeVisible();

  const numbers = page.getByRole("region", {
    name: "The college in numbers",
  });
  await expect(numbers.getByText("1943", { exact: true })).toBeVisible();
  await expect(numbers.getByText("1960", { exact: true })).toBeVisible();
  await expect(numbers.getByText("6", { exact: true })).toBeVisible();
  await expect(numbers.getByText("O + A", { exact: true })).toBeVisible();

  await expect(
    page.locator("#apply").getByRole("link", { name: "How to apply" }),
  ).toHaveAttribute("href", "/apply");

  const sciencePhoto = page
    .getByRole("img", {
      name: "Laboratory glassware with a test tube held above a bowl",
    })
    .first();
  await expect(sciencePhoto).toBeVisible();
  await expect
    .poll(() =>
      sciencePhoto.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.getByText(/\[To be confirmed:|\[Placeholder:/)).toHaveCount(
    0,
  );
});

test("subject pages show labelled illustrative examples", async ({ page }) => {
  await page.goto("/academics/o-level");
  await expect(
    page.getByRole("heading", {
      name: "Illustrative O-level subject examples",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Mathematics, English, Biology, Chemistry/i, {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/not confirmed college offerings/i),
  ).toBeVisible();

  await page.goto("/academics/a-level");
  await expect(
    page.getByRole("heading", {
      name: "Illustrative A-level subject examples",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/sample combination: Mathematics, Physics and Chemistry/i),
  ).toBeVisible();
  await expect(
    page.getByText(/not confirmed college offerings/i),
  ).toBeVisible();
});

test("panels expand on hover and keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const study = page.getByRole("link", { name: /^Study:/ });
  const students = page.getByRole("link", { name: /^Students:/ });

  const studyWidth = (await study.boundingBox())?.width ?? 0;
  const studentsWidth = (await students.boundingBox())?.width ?? 0;
  expect(studyWidth).toBeGreaterThan(studentsWidth);

  await students.hover();
  await expect
    .poll(async () => (await students.boundingBox())?.width ?? 0)
    .toBeGreaterThan(studentsWidth);
  await expect
    .poll(async () => (await study.boundingBox())?.width ?? 0)
    .toBeLessThan(studyWidth);

  await page.mouse.move(0, 0);
  await study.focus();
  await expect
    .poll(async () => (await study.boundingBox())?.width ?? 0)
    .toBeGreaterThan((await students.boundingBox())?.width ?? 0);
});

test("staff carousel arrows move the row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const track = page.getByRole("list", { name: "Staff carousel" });
  expect(await track.evaluate((element) => element.scrollLeft)).toBe(0);

  await page.getByRole("button", { name: "Next staff" }).click();
  await expect
    .poll(async () => track.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
});
