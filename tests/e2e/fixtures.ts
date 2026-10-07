import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

interface Options {
  /** Mark the session as already preloaded so tests start on an interactive page. */
  skipPreloader: boolean;
}

export const test = base.extend<Options>({
  skipPreloader: [true, { option: true }],
  page: async ({ page, skipPreloader }, use) => {
    if (skipPreloader) {
      await page.addInitScript(() => {
        sessionStorage.setItem("eclipse:preloaded", "1");
      });
    }
    await use(page);
  },
});
