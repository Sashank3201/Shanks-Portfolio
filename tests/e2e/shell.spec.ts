import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/lab", "/resume"] as const;

test.describe("site shell", () => {
  test("skip link is the first stop and jumps to main", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard journey is desktop-only");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test("Release persists and is restored before hydration", async ({ page }) => {
    await page.goto("/");
    const release = page.getByRole("button", { name: "Release" });
    await expect(release).toHaveAttribute("aria-pressed", "false");

    await release.click();
    await expect(release).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-release", "true");

    // Block scripts: only the inline <head> script can restore the realm now.
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-release", "true");
    const realm = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--realm"),
    );
    expect(realm).toBe("1");
  });

  test("reduce-motion toggle marks the document", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("footer").getByRole("button", { name: "Reduce motion" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  });

  test("mobile menu is a modal dialog that closes on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "menu button only renders on small screens");
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Work" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("menu links navigate and close the menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "menu button only renders on small screens");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Lab" }).click();
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  });
});

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    for (const realm of ["shinigami", "hollow"] as const) {
      test(`${route} has no axe violations in the ${realm} realm`, async ({ page }) => {
        if (realm === "hollow") {
          await page.addInitScript(() => {
            localStorage.setItem(
              "eclipse:prefs",
              JSON.stringify({ state: { release: true, motionPreference: "system" }, version: 1 }),
            );
          });
        }
        await page.goto(route);
        if (realm === "hollow") {
          await expect(page.locator("html")).toHaveAttribute("data-release", "true");
        }
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
