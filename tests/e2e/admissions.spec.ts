import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

import { E2E_USERS } from "./constants";

async function enableTestTurnstile(page: Page) {
  await page.route("**/turnstile/v0/api.js*", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
          window.turnstile = {
            render: function (container, options) {
              window.setTimeout(function () {
                options.callback("playwright-turnstile-token");
              }, 0);
              return "playwright-turnstile-widget";
            },
            remove: function () {}
          };
        `,
    }),
  );
}

async function signInAs(page: Page, role: keyof typeof E2E_USERS) {
  const credentials = E2E_USERS[role];
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    role === "admissions" ? /\/admin\/applications$/ : /\/admin$/,
  );
}

test("applicant submits a private-document application and Admissions reviews it", async ({
  page,
  browser,
}) => {
  test.setTimeout(60_000);
  await enableTestTurnstile(page);
  await page.goto("/apply");

  await page.getByLabel("Applicant full name").fill("E2E Applicant");
  await page.getByLabel("Date of birth").fill("2012-04-15");
  await page.getByLabel("Sex").fill("Male");
  await page.getByLabel("Nationality").fill("Ugandan");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Previous school").fill("Arua Primary School");
  await page.getByLabel("School district").fill("Arua");
  await page.getByLabel("Year of completion").fill("2025");
  await page.getByLabel("PLE index number").fill("PLE 123456");
  await page.getByLabel("PLE aggregate").fill("8");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Parent or guardian name").fill("E2E Guardian");
  await page.getByLabel("Relationship to applicant").fill("Parent");
  await page.getByLabel("Phone number", { exact: true }).fill("+256700000000");
  await page.getByLabel("Email address").fill("guardian@example.test");
  await page.getByLabel("Residential address").fill("Arua City");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.locator('input[name="resultSlip"]').setInputFiles({
    name: "e2e-result.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nE2E test document"),
  });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Submit" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit application" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page).toHaveURL(/\/apply\/confirmation\?reference=/, {
    timeout: 20_000,
  });
  await expect(
    page.getByRole("heading", { name: "Application received" }),
  ).toBeVisible();

  await signInAs(page, "admissions");
  await page.goto("/admin/applications");
  await expect(page.getByText("E2E Applicant")).toBeVisible();
  await expect(page.getByText("e2e-result.pdf")).toBeVisible();
  await mkdir("test-results/screenshots", { recursive: true });
  for (const width of [1440, 1024, 820, 640, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows, `Admissions admin overflows at ${width}px`).toBe(false);
    await page.screenshot({
      path: `test-results/screenshots/applications-admin-${width}.png`,
      caret: "initial",
    });
  }
  await page.setViewportSize({ width: 1280, height: 720 });

  const fileLink = page.getByRole("link", { name: "e2e-result.pdf" });
  const fileUrl = await fileLink.getAttribute("href");
  expect(fileUrl).toBeTruthy();
  const fileResponse = await page.request.get(fileUrl!);
  expect(fileResponse.status()).toBe(200);
  expect(fileResponse.headers()["content-type"]).toContain("application/pdf");
  expect((await fileResponse.body()).subarray(0, 5).toString()).toBe("%PDF-");

  const applicationCard = page.locator(".admin-application-card").filter({
    hasText: "E2E Applicant",
  });
  await applicationCard
    .locator('select[name="status"]')
    .selectOption("in_review");
  await applicationCard.getByRole("button", { name: "Save status" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Application status updated.",
  );
  await applicationCard.getByText("Status history").click();
  await expect(
    applicationCard
      .locator(".admin-application-history")
      .getByText("In review", { exact: true }),
  ).toBeVisible();

  const csv = await page.request.get(
    "/api/admin/applications/export?type=applications",
  );
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain("E2E Applicant");

  const editorContext = await browser.newContext();
  const editorPage = await editorContext.newPage();
  await signInAs(editorPage, "editor");
  const deniedFileResponse = await editorPage.request.get(fileUrl!);
  expect(deniedFileResponse.status()).toBe(404);
  await editorContext.close();
});

test("application wizard validates entry-class results and restores its draft", async ({
  page,
}) => {
  await page.goto("/apply");
  await page.getByLabel("Applicant full name").fill("Draft Applicant");
  await page.getByLabel("Date of birth").fill("2012-04-15");
  await page.getByLabel("Sex").fill("Female");
  await page.getByLabel("Nationality").fill("Ugandan");
  await page.getByLabel("Entry class").selectOption("Senior Five");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Previous school").fill("Arua Secondary School");
  await page.getByLabel("School district").fill("Arua");
  await page.getByLabel("Year of completion").fill("2025");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#application-uceIndexNumber-error")).toBeVisible();
  await expect(page.locator("#application-uceResults-error")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Previous school and results" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Applicant full name")).toHaveValue(
    "Draft Applicant",
  );
  await expect(page.getByLabel("Entry class")).toHaveValue("Senior Five");

  const serverValidation = await page.evaluate(async () => {
    const form = new FormData();
    form.set("application", "{}");
    const response = await fetch("/api/apply", {
      method: "POST",
      body: form,
    });
    return {
      status: response.status,
      body: (await response.json()) as {
        fieldErrors?: Record<string, string[]>;
      },
    };
  });
  expect(serverValidation.status).toBe(400);
  expect(serverValidation.body.fieldErrors).toHaveProperty("applicantName");
});

test("contact enquiry is saved and visible to Admissions", async ({ page }) => {
  await enableTestTurnstile(page);
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("E2E Parent");
  await page.getByLabel("Email address").fill("parent@example.test");
  await page.getByLabel("Subject").fill("Admissions question");
  await page
    .getByLabel("Message")
    .fill("Please tell me how to contact the admissions office.");
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Thank you. Your message has been sent to the school.",
  );

  await signInAs(page, "admissions");
  await page.goto("/admin/enquiries");
  await expect(page.getByText("E2E Parent")).toBeVisible();
  await expect(page.getByText("Admissions question")).toBeVisible();
  const csv = await page.request.get(
    "/api/admin/applications/export?type=enquiries",
  );
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain("E2E Parent");
});

test("closed applications show the confirmed contact route", async ({
  page,
}) => {
  await signInAs(page, "admin");
  await page.goto("/admin/settings");
  const applicationsOpen = page.getByRole("checkbox", {
    name: "Applications are open",
  });
  await expect(applicationsOpen).toBeChecked();

  try {
    await applicationsOpen.uncheck();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Changes published.")).toBeVisible();
    await page.goto("/apply");
    await expect(
      page.getByText(
        "Applications are not open at this time. Please contact the school for current information.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Contact the school" }),
    ).toHaveAttribute("href", "/contact");
    await expect(
      page.getByRole("heading", { name: "Online application" }),
    ).toBeVisible();
    await expect(page.getByLabel("Applicant full name")).toHaveCount(0);
  } finally {
    await page.goto("/admin/settings");
    const currentToggle = page.getByRole("checkbox", {
      name: "Applications are open",
    });
    if (!(await currentToggle.isChecked())) {
      await currentToggle.check();
      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByText("Changes published.")).toBeVisible();
    }
  }
});

test("application and contact forms fit every reference viewport", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await mkdir("test-results/screenshots", { recursive: true });

  for (const width of [1440, 1024, 820, 640, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/apply", "/contact"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1")).toHaveCount(1);
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows, `${route} overflows at ${width}px`).toBe(false);
      await page.screenshot({
        path: `test-results/screenshots/${route.slice(1)}-${width}.png`,
        caret: "initial",
      });
    }
  }
});
