import { expect, test } from "@playwright/test";

const paths = ["/", "/express-entry-draws", "/tools/diagnostic", "/plans", "/review"];

for (const path of paths) {
  test(`${path} does not scroll sideways at 375px`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
