#!/usr/bin/env node
/**
 * Visual review helper: captures full-page and viewport screenshots of a running site.
 *
 *   node scripts/shots.mjs [baseUrl] [outDir] [path …]
 *
 * Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to reuse a pre-installed Chromium.
 * Query params are passed through, e.g. "/?static=1".
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const [baseUrl = "http://127.0.0.1:3100", outDir = ".cache/shots", ...paths] =
  process.argv.slice(2);
const routes = paths.length > 0 ? paths : ["/"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

await mkdir(outDir, { recursive: true });

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      console.warn(`[${viewport.name}] console.${msg.type()}: ${msg.text()}`);
    }
  });
  page.on("pageerror", (error) => console.warn(`[${viewport.name}] pageerror: ${error.message}`));

  for (const route of routes) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(Number(process.env.SHOT_DELAY ?? 800));
    const slug = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    await page.screenshot({ path: path.join(outDir, `${slug}-${viewport.name}.png`) });
    if (process.env.FULL_PAGE) {
      await page.screenshot({
        path: path.join(outDir, `${slug}-${viewport.name}-full.png`),
        fullPage: true,
      });
    }
  }
  await context.close();
}

await browser.close();
console.warn(`Saved screenshots to ${outDir}`);
