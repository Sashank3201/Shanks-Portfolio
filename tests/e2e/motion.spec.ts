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

test.describe("hero dive", () => {
  test("pins the hero while the camera dives into the eclipse", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".pin-spacer > section[aria-labelledby='hero-title']")).toHaveCount(
      1,
    );
    // Past the pin, the next chapter is reachable and the hero copy has gone.
    await page.locator("#about").scrollIntoViewIfNeeded();
    await expect(page.locator("#about-title")).toBeInViewport({ timeout: 5_000 });
  });

  test("keeps the hero in the flow under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});

test.describe("release mark", () => {
  test("the logo crescent morphs into the horned mask and back", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("header .logo-mark");
    const morph = logo.locator("[data-logo-morph]");
    const release = page.getByRole("button", { name: "Release" });
    await expect(morph).toHaveAttribute("data-shape", "crescent");
    await expect(logo.locator(".logo-crescent")).toHaveCSS("opacity", "1");

    await release.click();
    await expect(morph).toHaveAttribute("data-shape", "mask");
    // The morph layer hands back to the static mask once the shape has changed.
    await expect(logo).not.toHaveAttribute("data-morphing", /.*/, { timeout: 5_000 });
    await expect(logo.locator(".logo-mask")).toHaveCSS("opacity", "1");

    await release.click();
    await expect(morph).toHaveAttribute("data-shape", "crescent");
    await expect(logo).not.toHaveAttribute("data-morphing", /.*/, { timeout: 5_000 });
    await expect(logo.locator(".logo-crescent")).toHaveCSS("opacity", "1");
  });

  test("swaps without morphing under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const logo = page.locator("header .logo-mark");

    await page.getByRole("button", { name: "Release" }).click();
    await expect(logo).not.toHaveAttribute("data-morphing", /.*/);
    await expect(logo.locator(".logo-mask")).toHaveCSS("opacity", "1");
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

test.describe("webgl stage", () => {
  test("keeps the CSS eclipse on software renderers", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-webgl", "fallback");
    await expect(page.locator(".stage")).toHaveCount(0);
    await expect(page.locator("[data-eclipse-anchor] > *").first()).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-stage-fallback]")).toHaveCSS("opacity", "1");
  });

  // Headless browsers rasterise in software, where the site deliberately keeps the CSS eclipse;
  // ?webgl=force opts these tests into the WebGL stage regardless.
  test("draws its first frame and takes over from the CSS eclipse", async ({ page }) => {
    await page.goto("/?webgl=force");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-webgl", "ready", { timeout: 20_000 });
    await expect(page.locator(".stage canvas")).toBeVisible();
    // The CSS eclipse and spire step aside once WebGL draws (the anchor keeps positioning it).
    await expect(page.locator("[data-eclipse-anchor] > *").first()).toHaveCSS("opacity", "0");
    await expect(page.locator("[data-stage-fallback]")).toHaveCSS("opacity", "0");
  });

  test("renders a frozen frame in static mode", async ({ page }) => {
    await page.goto("/?static=1&webgl=force");
    await expect(page.locator("html")).toHaveAttribute("data-static", "");
    await expect(page.locator("html")).toHaveAttribute("data-webgl", "ready", { timeout: 20_000 });
  });
});
