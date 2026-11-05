import { expect, test, type Page } from "@playwright/test";

import { E2E_USERS } from "./constants";

async function signInAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(E2E_USERS.admin.email);
  await page.getByLabel("Password").fill(E2E_USERS.admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function fillField(page: Page, label: string, value: string, index = 0) {
  await page.getByLabel(label, { exact: false }).nth(index).fill(value);
}

async function fillPanelDescription(
  page: Page,
  panelLabel: string,
  description: string,
) {
  const panelLabels = page.getByLabel("Panel label", { exact: false });
  const panelIndex = await panelLabels.evaluateAll(
    (inputs, label) =>
      inputs.findIndex((input) => (input as HTMLInputElement).value === label),
    panelLabel,
  );
  expect(panelIndex).toBeGreaterThanOrEqual(0);
  await fillField(page, "Panel description", description, panelIndex);
}

test("publishing Home fields updates the public homepage", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/pages/home");

  await fillField(page, "Heading", "Phase E homepage", 0);
  await fillField(page, "Highlighted heading", "is editable.");
  await fillPanelDescription(page, "Study", "Phase E panel copy.");
  await fillField(page, "Fact value", "Phase E fact");
  await fillField(page, "Learning section heading", "Phase E learning");
  await fillField(
    page,
    "Learning section introduction",
    "Learning copy updated.",
  );
  await fillField(page, "Sports section heading", "Phase E sports");
  await fillField(page, "Staff section heading", "Phase E staff");
  await fillField(page, "Achievements section heading", "Phase E honours");
  await fillField(page, "Old Boys section heading", "Phase E Old Boys");
  await fillField(
    page,
    "Old Boys section introduction",
    "Old Boys copy updated.",
  );

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Changes published.")).toBeVisible();

  const publicPage = await page.context().newPage();
  await publicPage.goto("/");
  await expect(publicPage.getByRole("heading", { level: 1 })).toContainText(
    "Phase E homepage is editable.",
  );
  await expect(
    publicPage.getByRole("link", { name: "Study: Phase E panel copy." }),
  ).toBeVisible();
  await expect(publicPage.getByText("Phase E fact")).toBeVisible();
  await expect(
    publicPage.getByRole("heading", { name: "Phase E learning" }),
  ).toBeVisible();
  await expect(publicPage.getByText("Learning copy updated.")).toBeVisible();
  await expect(
    publicPage.getByRole("heading", { name: "Phase E sports" }),
  ).toBeVisible();
  await expect(
    publicPage.getByRole("heading", { name: "Phase E staff" }),
  ).toBeVisible();
  await expect(
    publicPage.getByRole("heading", { name: "Phase E honours" }),
  ).toBeVisible();
  await expect(
    publicPage.getByRole("heading", { name: "Phase E Old Boys" }),
  ).toBeVisible();
  await expect(publicPage.getByText("Old Boys copy updated.")).toBeVisible();
  await publicPage.close();
});

test("publishing Settings updates the header, footer, notice and floating controls", async ({
  page,
}) => {
  await signInAsAdmin(page);
  await page.goto("/admin/settings");

  await fillField(page, "School name", "Phase E College");
  await fillField(page, "Apply button text", "Apply with us");
  await fillField(page, "WhatsApp number", "256700123456");
  await fillField(page, "WhatsApp message", "A test message from Settings.");
  await fillField(page, "WhatsApp button text", "Message Ombaci");
  await fillField(page, "Assistant button text", "School information");
  await fillField(page, "Menu button text", "Explore");
  await fillField(page, "Close button text", "Hide menu");
  await fillField(page, "Visit section heading", "Find the college");
  await fillField(page, "Contact section heading", "Reach the office");
  await fillField(page, "Link label", "College", 0);
  await fillField(page, "Group title", "Explore Phase E");
  await page.getByLabel("Show the notice bar", { exact: false }).check();
  await fillField(page, "Notice text", "Phase E notice is live.");
  await page
    .getByLabel("Show the school assistant", { exact: false })
    .uncheck();

  await expect(page.locator('input[name="fields"]')).toHaveValue(
    /"whatsappNumber":"256700123456"/,
  );
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Changes published.")).toBeVisible();

  const publicPage = await page.context().newPage();
  await publicPage.goto("/");
  await expect(
    publicPage.getByRole("link", { name: /Phase E College/ }),
  ).toBeVisible();
  await expect(
    publicPage.getByRole("link", { name: "College", exact: true }),
  ).toBeVisible();
  await expect(publicPage.getByText("Phase E notice is live.")).toBeVisible();
  await expect(publicPage.getByText("Find the college")).toBeVisible();
  await expect(publicPage.getByText("Reach the office")).toBeVisible();
  await expect(
    publicPage.getByRole("link", { name: "Apply with us" }),
  ).toHaveAttribute("href", "/apply");
  await expect(
    publicPage.getByRole("link", { name: "Message Ombaci" }),
  ).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/256700123456\?text=A%20test%20message%20from%20Settings\./,
  );
  await expect(
    publicPage.getByRole("button", { name: "School information" }),
  ).toHaveCount(0);

  await publicPage.setViewportSize({ width: 375, height: 900 });
  await publicPage.getByRole("button", { name: "Explore" }).click();
  await expect(
    publicPage.getByRole("button", { name: "Hide menu" }),
  ).toBeVisible();
  await publicPage.close();
});
