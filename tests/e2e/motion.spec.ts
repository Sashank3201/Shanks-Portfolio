import { expect, test } from "./fixtures";

test.describe("preloader", () => {
  test.use({ skipPreloader: false });

  test("plays once per session, then hands over to the hero", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-loading", "");
    await expect(page.locator(".preloader")).toBeVisible();

    await expect(html).not.toHaveAttribute("data-loading", /.*/, { timeout: 10_000 });
    await expect(page.locator(".preloader")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.reload();
    await expect(html).not.toHaveAttribute("data-loading", /.*/);
  });

  test("is skipped entirely under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-loading", /.*/);
    await expect(page.locator(".preloader")).toBeHidden();
  });
});

test.describe("reduced motion", () => {
  test("turns off smooth scrolling and the custom cursor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await expect(page.locator(".cursor")).toHaveCount(0);
  });
});

test.describe("navigation choreography", () => {
  test("the slash transition lands on the new page and releases the screen", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop navigation");
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Lab" })
      .click();
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experiments are brewing.");
    await expect(page.locator(".route-transition")).toHaveAttribute("data-active", "false", {
      timeout: 5_000,
    });
  });

  test("section links scroll within the page and update the hash", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" })
      .click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("#work-title")).toBeInViewport({ timeout: 5_000 });
  });

  test("the header steps aside while reading down and returns on the way up", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "pointer-driven scrolling");
    await page.goto("/");
    const header = page.locator("header").first();

    await page.mouse.move(700, 450);
    for (let step = 0; step < 6; step++) await page.mouse.wheel(0, 500);
    await expect(header).not.toBeInViewport({ timeout: 5_000 });

    for (let step = 0; step < 2; step++) await page.mouse.wheel(0, -300);
    await expect(header).toBeInViewport({ timeout: 5_000 });
  });
});
