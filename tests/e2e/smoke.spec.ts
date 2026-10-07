import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./fixtures";
import { profile } from "../../src/content/profile";

test.describe("smoke", () => {
  test("home renders with a main landmark and the owner's name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(new RegExp(profile.name));
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.name);
  });

  test("every home chapter renders", async ({ page }) => {
    await page.goto("/");
    for (const title of [
      "A soul split between precision and spectacle.",
      "Blades forged in production.",
      "Every battle left a mark.",
      "Techniques, sealed and released.",
      "The gate is open.",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeAttached();
    }
    await expect(page.getByRole("link", { name: new RegExp(profile.email) })).toHaveAttribute(
      "href",
      `mailto:${profile.email}`,
    );
  });

  test("nothing overflows the viewport sideways", async ({ page }) => {
    await page.goto("/?static=1");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test("unknown routes land in the themed 404", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lost in the Dangai.");
  });

  test("home has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
