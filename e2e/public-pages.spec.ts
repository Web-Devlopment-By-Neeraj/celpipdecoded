import { expect, test } from "@playwright/test";

const FORBIDDEN = /your celpip score/i;

test.describe("public pages", () => {
  test("CRS form returns a server-rendered estimate without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto("/crs");

    await expect(page.getByRole("heading", { name: "CRS calculator" })).toBeVisible();
    await expect(page.getByLabel("Job offer")).toContainText("not currently awarded");
    await page.getByLabel("Age in years").fill("29");
    await page.locator('select[name="education"]').selectOption("doctoral");
    await page.getByLabel("Canadian work experience, in years").fill("5");
    await page.getByRole("button", { name: "Calculate" }).click();

    await expect(page.getByRole("heading", { name: "Estimate: 483" })).toBeVisible();
    await expect(page.getByText("Core 408")).toBeVisible();
    await expect(page.getByText("Transferability 75")).toBeVisible();
    await expect(page.getByText(/reaching CLB 10 in all four abilities adds 93/)).toBeVisible();
    await expect(page.getByText("not immigration advice")).toBeVisible();
    await expect(page.getByText(/Points last verified/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Official IRCC CRS calculator" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Save to my account" })).toHaveAttribute(
      "href",
      expect.stringContaining("/signup?next="),
    );
    await expect(page.content()).resolves.not.toMatch(FORBIDDEN);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });

  test("checkout success does not grant access by itself", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/checkout/success");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Setting up your access");
    await expect(page.getByText("does not unlock anything by itself")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("draws page keeps the estimate and does not predict an invitation", async ({ page }) => {
    await page.goto("/draws?total=483");
    await expect(page.getByText("Your calculator estimate was 483.")).toBeVisible();
    await expect(page.getByText("does not predict an invitation")).toBeVisible();
    await expect(page.getByRole("link", { name: "Official Express Entry rounds" })).toBeVisible();
    await expect(page.content()).resolves.not.toMatch(FORBIDDEN);
  });

  test("the help bubble is labelled as an AI assistant", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/crs");
    await page.getByRole("button", { name: "AI assistant" }).click();
    await expect(page.getByText("I am an AI assistant.")).toBeVisible();
    await expect(page.getByLabel("Your question")).toBeVisible();
  });
});
