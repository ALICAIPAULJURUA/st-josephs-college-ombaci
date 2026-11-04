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
              window.playwrightTurnstileOptions = options;
              window.setTimeout(function () {
                options.callback("playwright-turnstile-token");
              }, 0);
              return "playwright-turnstile-widget";
            },
            remove: function () {},
            reset: function () {
              window.setTimeout(function () {
                window.playwrightTurnstileOptions.callback("playwright-turnstile-token");
              }, 0);
            }
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

  await page.locator("#application-studentFirstName").fill("E2E");
  await page.locator("#application-studentLastName").fill("Applicant");
  await page.locator("#application-dateOfBirth").fill("2012-04-15");
  await page.locator("#application-gender").selectOption("Male");
  await page
    .locator("#application-gradeApplyingFor")
    .selectOption("Senior One");
  await page.locator("#application-previousSchool").fill("Arua Primary School");
  await page.locator("#application-guardianFirstName").fill("E2E");
  await page.locator("#application-guardianLastName").fill("Guardian");
  await page
    .locator("#application-guardianEmail")
    .fill("guardian@example.test");
  await page.locator("#application-guardianPhone").fill("+256700000000");
  await page.locator("#application-guardianAddress").fill("Arua City");
  await page
    .locator("#application-emergencyContactName")
    .fill("Emergency Contact");
  await page
    .locator("#application-emergencyContactPhone")
    .fill("+256700000001");
  await page
    .locator("#application-emergencyContactRelationship")
    .fill("Parent");
  let firstSubmissionFailed = false;
  await page.route("**/api/apply", async (route) => {
    if (!firstSubmissionFailed) {
      firstSubmissionFailed = true;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "The application service is temporarily unavailable.",
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.locator('input[name="birthCertificate"]').setInputFiles({
    name: "e2e-birth-certificate.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nE2E test document"),
  });
  await page.getByRole("checkbox").check();
  const submitButton = page.getByRole("button", {
    name: "Submit Application",
  });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await expect(page.locator("form [role='alert']")).toHaveText(
    "The application service is temporarily unavailable.",
  );
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await expect(page).toHaveURL(/\/apply\/confirmation\?reference=/, {
    timeout: 20_000,
  });
  await expect(
    page.getByRole("heading", { name: "Application received" }),
  ).toBeVisible();

  await signInAs(page, "admissions");
  await page.goto("/admin/applications");
  const applicationCard = page.locator(".admin-application-card").first();
  await expect(applicationCard).toContainText("Student Information");
  await expect(applicationCard).toContainText("Parent/Guardian Information");
  await expect(applicationCard).toContainText("Emergency Contact");
  await expect(
    applicationCard.getByText("e2e-birth-certificate.pdf"),
  ).toBeVisible();
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

  const fileLink = page.getByRole("link", {
    name: "e2e-birth-certificate.pdf",
  });
  const fileUrl = await fileLink.getAttribute("href");
  expect(fileUrl).toBeTruthy();
  const fileResponse = await page.request.get(fileUrl!);
  expect(fileResponse.status()).toBe(200);
  expect(fileResponse.headers()["content-type"]).toContain("application/pdf");
  expect((await fileResponse.body()).subarray(0, 5).toString()).toBe("%PDF-");

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
  expect(await csv.text()).toContain('"E2E","Applicant"');

  const editorContext = await browser.newContext();
  const editorPage = await editorContext.newPage();
  await signInAs(editorPage, "editor");
  const deniedFileResponse = await editorPage.request.get(fileUrl!);
  expect(deniedFileResponse.status()).toBe(404);
  await editorContext.close();
});

test("application validates required details and restores its draft", async ({
  page,
}) => {
  await enableTestTurnstile(page);
  await page.goto("/apply");
  await expect(
    page.getByRole("group", { name: "Student Information" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Academic Information" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Parent/Guardian Information" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Emergency Contact" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Medical Information" }),
  ).toBeVisible();
  await expect(page.locator("#application-gender option")).toHaveText([
    "Select gender",
    "Male",
    "Female",
  ]);
  await expect(page.locator("#application-gradeApplyingFor option")).toHaveText(
    ["Select a grade", "Senior One", "Senior Five"],
  );

  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(
    page.locator("#application-studentFirstName-error"),
  ).toBeVisible();
  await expect(
    page.locator("#application-emergencyContactPhone-error"),
  ).toBeVisible();
  await expect(page.locator("#application-consent-error")).toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(page.locator("#application-consent-error")).toBeHidden();

  await page.locator("#application-studentFirstName").fill("Draft");
  await page.locator("#application-studentLastName").fill("Applicant");
  await page.locator("#application-dateOfBirth").fill("2012-04-15");
  await page.locator("#application-gender").selectOption("Female");
  await page
    .locator("#application-gradeApplyingFor")
    .selectOption("Senior Five");

  await page.reload();
  await expect(page.locator("#application-studentFirstName")).toHaveValue(
    "Draft",
  );
  await expect(page.locator("#application-gradeApplyingFor")).toHaveValue(
    "Senior Five",
  );

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
  expect(serverValidation.body.fieldErrors).toHaveProperty("studentFirstName");
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
      if (route === "/apply") {
        await expect(
          page.getByRole("group", { name: "Required Documents" }),
        ).toBeVisible();
        const uploadsOverflow = await page
          .locator('input[type="file"]')
          .evaluateAll((inputs) =>
            inputs.some(
              (input) =>
                input.getBoundingClientRect().right >
                document.documentElement.clientWidth,
            ),
          );
        expect(
          uploadsOverflow,
          `Application uploads overflow at ${width}px`,
        ).toBe(false);
      }
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
