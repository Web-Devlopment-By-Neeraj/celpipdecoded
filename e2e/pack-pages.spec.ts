import { expect, test } from "@playwright/test";

const FORBIDDEN = /your celpip score/i;

const PAGES: Array<{ path: string; heading: string }> = [
  { path: "/pricing", heading: "Choose how you practice" },
  { path: "/diagnostic", heading: "What should you practice?" },
  { path: "/courses", heading: "Course" },
  { path: "/ask", heading: "Ask Amar" },
  { path: "/book", heading: "Book" },
  { path: "/blog", heading: "Practice notes" },
  { path: "/legal/privacy", heading: "Privacy" },
  { path: "/legal/terms", heading: "Terms" },
  { path: "/legal/refunds", heading: "Refunds" },
];

test.describe("pack pages at 375px", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });

  for (const entry of PAGES) {
    test(`${entry.path} renders without a forbidden score claim`, async ({ page }) => {
      await page.goto(entry.path);
      await expect(page.getByRole("heading", { level: 1, name: entry.heading })).toBeVisible();
      await expect(page.content()).resolves.not.toMatch(FORBIDDEN);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("diagnostic form returns a next step without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto("/diagnostic");
    await page.locator('select[name="skill"]').selectOption("writing");
    await page.getByRole("button", { name: "Show a next step" }).click();
    await expect(page.getByText("Write one email reply inside the word range")).toBeVisible();
    await context.close();
  });

  test("pricing lists the four starting plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("$49.00 CAD").first()).toBeVisible();
    await expect(page.getByText("$199.00 CAD")).toBeVisible();
    await expect(page.getByText("$99.00 CAD")).toBeVisible();
  });

  test("courses keep paid lessons visible and mark coming-soon languages", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("Locked.")).toBeVisible();
    await expect(page.getByText("Soon").first()).toBeVisible();
  });

  test("sitemap and robots advertise the public pages only", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const path of ["/pricing", "/diagnostic", "/courses", "/ask", "/book", "/legal/privacy"]) {
      expect(xml).toContain(path);
    }
    const robots = await request.get("/robots.txt");
    const body = await robots.text();
    expect(body).toContain("Disallow: /dashboard");
    expect(body).toContain("Disallow: /api/");
  });
});
