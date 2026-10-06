import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { profile } from "../../src/content/profile";

test.describe("smoke", () => {
  test("home renders with a main landmark and the owner's name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(new RegExp(profile.name));
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.name);
  });

  test("home has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
