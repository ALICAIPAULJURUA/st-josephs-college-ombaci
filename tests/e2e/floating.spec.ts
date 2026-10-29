import { expect, test } from "@playwright/test";

const launcherName = "Ask OMBACIAN Assistant";
const storageKey = "ombacian-assistant-conversation-v1";

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
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
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
    dialog.getByText("The live assistant is not connected yet.", {
      exact: false,
    }),
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

test("assistant becomes a bottom sheet on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");

  const launcher = page.getByRole("button", { name: launcherName });
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
