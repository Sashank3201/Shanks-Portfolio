import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home renders with a main landmark and a title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Eclipse/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("home has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
