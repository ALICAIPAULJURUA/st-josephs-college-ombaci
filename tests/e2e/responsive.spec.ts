import { expect, test } from "@playwright/test";

const widths = [1440, 1024, 820, 640, 375];
const routes = [
  { path: "/", name: "home" },
  { path: "/design", name: "design" },
];

for (const route of routes) {
  test.describe(`${route.name} layout`, () => {
    for (const width of widths) {
      test(`has no horizontal scroll at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);
        await page.waitForFunction(() =>
          Array.from(document.images).every((image) => image.complete),
        );
        await page.evaluate(() => document.fonts.ready);

        const overflows = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );

        expect(overflows).toBe(false);

        await page.screenshot({
          path: `test-results/screenshots/${route.name}-${width}.png`,
          fullPage: true,
        });
      });
    }
  });
}
