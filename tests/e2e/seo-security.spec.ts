import { expect, test } from "@playwright/test";

test("public metadata has a canonical, social metadata, and nonce CSP", async ({
  page,
}) => {
  const response = await page.goto("/sports/rugby");
  expect(response?.ok()).toBe(true);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/sports\/rugby$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Rugby/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const policy = response?.headers()["content-security-policy"] ?? "";
  const scriptPolicy = policy
    .split(";")
    .find((directive) => directive.trim().startsWith("script-src"));
  expect(scriptPolicy).toContain("'nonce-");
  expect(scriptPolicy).not.toContain("'self'");

  const jsonLdNonce = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .evaluate((element) =>
      element instanceof HTMLScriptElement ? element.nonce : "",
    );
  expect(jsonLdNonce).not.toBe("");
  expect(scriptPolicy).toContain(`'nonce-${jsonLdNonce}'`);
});

test("admin CSP permits local scripts needed by TinyMCE", async ({ page }) => {
  const response = await page.goto("/admin/login");
  expect(response?.ok()).toBe(true);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/crest.png",
  );

  const policy = response?.headers()["content-security-policy"] ?? "";
  const scriptPolicy = policy
    .split(";")
    .find((directive) => directive.trim().startsWith("script-src"));
  expect(scriptPolicy).toContain("'self'");
  expect(scriptPolicy).toContain("'nonce-");
});

test("sitemap and robots list database routes and private paths", async ({
  page,
}) => {
  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/news");
  expect(sitemapText).not.toContain("/admin");

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /admin");
  expect(robotsText).toContain("Disallow: /api");
  expect(robotsText).toContain("Disallow: /apply");
  expect(robotsText).toContain("Sitemap:");
});
