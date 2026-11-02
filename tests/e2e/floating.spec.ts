import { expect, test } from "@playwright/test";

const launcherName = "Ask OMBACIAN Assistant";
const storageKey = "ombacian-assistant-conversation-v1";

async function enableTestTurnstile(page: import("@playwright/test").Page) {
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
          remove: function () {},
          reset: function () {}
        };
      `,
    }),
  );
}

async function mockAssistantReply(
  page: import("@playwright/test").Page,
  reply: string,
) {
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: `data: ${JSON.stringify(reply)}\n\ndata: [DONE]\n\n`,
    });
  });
}

test("floating controls sit at the viewport edges", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const apply = page.getByRole("link", { name: "Apply now", exact: true });
  await expect(apply).toBeVisible();
  await expect(apply).toHaveAttribute("href", "/apply");

  const box = await apply.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.x).toBeCloseTo(24, 0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(876, 0);

  const whatsapp = page.getByRole("link", {
    name: "Chat on WhatsApp",
    exact: true,
  });
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/256770911635\?text=/,
  );
});

test("assistant launcher expands on hover and collapses when the pointer leaves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await expect(launcher).toHaveCSS("width", "48px");
  await launcher.hover();
  await expect(launcher).toHaveCSS("width", "236px");
  await page.mouse.move(0, 0);
  await expect(launcher).toHaveCSS("width", "48px");
});

test("assistant launcher expands when reached by keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await page.getByRole("link", { name: "Apply now", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(launcher).toBeFocused();
  await expect(launcher).toHaveCSS("width", "236px");
});

test("assistant opens, focuses the input and returns focus on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await launcher.click();

  const dialog = page.getByRole("dialog", { name: "OMBACIAN Assistant" });
  await expect(dialog).toBeVisible();
  await expect(launcher).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByLabel("Your question")).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: "How do I apply for Senior One?" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  await expect(launcher).toBeFocused();
});

test("assistant close button returns focus to the launcher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await launcher.click();
  await page
    .getByRole("dialog", { name: "OMBACIAN Assistant" })
    .getByRole("button", { name: "Close assistant" })
    .click();

  await expect(launcher).toBeFocused();
});

test("assistant answers a suggestion and keeps the conversation in session", async ({
  page,
}) => {
  await enableTestTurnstile(page);
  await mockAssistantReply(
    page,
    "Applications start at [the application page](/apply).",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const question = "How do I apply for Senior One?";
  const launcher = page.getByRole("button", { name: launcherName });
  await launcher.click();

  let dialog = page.getByRole("dialog", { name: "OMBACIAN Assistant" });
  await dialog.getByRole("button", { name: question }).click();

  const log = dialog.getByRole("log");
  await expect(log.getByText(question, { exact: true })).toBeVisible();
  await expect(dialog.getByText("Assistant is typing...")).toBeVisible();
  await expect(
    log.getByRole("link", { name: "the application page" }),
  ).toBeVisible();

  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key), storageKey))
    .toContain(question);

  await page.reload();
  await launcher.click();

  dialog = page.getByRole("dialog", { name: "OMBACIAN Assistant" });
  await expect(
    dialog.getByRole("log").getByText(question, { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "What does a boarder bring?" }),
  ).toHaveCount(0);
});

test("assistant reports a mocked service error without losing the question", async ({
  page,
}) => {
  await enableTestTurnstile(page);
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "The assistant is temporarily unavailable.",
      }),
    }),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "OMBACIAN Assistant" });
  const question = "What are the current school fees?";
  await dialog.getByLabel("Your question").fill(question);
  await dialog.getByRole("button", { name: "Send" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "The assistant is temporarily unavailable.",
  );
  await expect(
    dialog.getByRole("log").getByText(question, { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("I can't answer right now.", { exact: false }),
  ).toBeVisible();
});

test("assistant becomes a bottom sheet on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
  await expect(page.getByText(launcherName, { exact: true })).toBeVisible();
  await expect(launcher).toHaveCSS("width", "236px");
  await launcher.click();

  const dialog = page.getByRole("dialog", { name: "OMBACIAN Assistant" });
  await expect(dialog).toBeVisible();
  await expect(launcher).toBeHidden();

  const box = await dialog.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.x).toBeCloseTo(0, 0);
  expect(box?.width).toBeCloseTo(375, 0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(900, 0);
});
