#!/usr/bin/env node
/**
 * Builds the Japanese accent font: a tiny subset of Noto Serif JP (SIL OFL 1.1) that contains
 * only the glyphs listed in src/assets/fonts/jp-glyphs.json, instanced at a single weight.
 *
 *   pnpm fonts:jp
 *
 * Outputs:
 *   src/assets/fonts/web/noto-serif-jp-accents.woff2   (served via next/font/local)
 *   src/assets/fonts/static/noto-serif-jp-accents.ttf  (OG image + PDF renderers)
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import subsetFont from "subset-font";

const SOURCE_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf";
const WEIGHT = 500;

const root = path.resolve(import.meta.dirname, "..");
const fontsDir = path.join(root, "src/assets/fonts");
const cacheFile = path.join(root, ".cache/fonts/NotoSerifJP-wght.ttf");

/** Expands the manifest into the exact string of glyphs to keep. */
function glyphText(manifest) {
  const fromChars = manifest.chars.map((entry) => entry.value).join("");
  const fromRanges = manifest.ranges
    .map(({ from, to }) => {
      const start = Number.parseInt(from, 16);
      const end = Number.parseInt(to, 16);
      return String.fromCodePoint(...Array.from({ length: end - start + 1 }, (_, i) => start + i));
    })
    .join("");
  return [...new Set(fromChars + fromRanges)].join("");
}

async function main() {
  if (!existsSync(cacheFile)) {
    await mkdir(path.dirname(cacheFile), { recursive: true });
    console.warn(`Downloading Noto Serif JP source → ${path.relative(root, cacheFile)}`);
    // curl honours HTTPS_PROXY / corporate CA settings, unlike Node's built-in fetch.
    execFileSync("curl", ["-fsSL", "-o", cacheFile, SOURCE_URL], { stdio: "inherit" });
  }

  const manifest = JSON.parse(await readFile(path.join(fontsDir, "jp-glyphs.json"), "utf8"));
  const text = glyphText(manifest);
  const source = await readFile(cacheFile);
  const options = {
    variationAxes: { wght: WEIGHT },
    // Only the features accents need: vertical forms for `writing-mode: vertical-rl`, composition,
    // localisation and kerning. Keeping every feature (aalt, hwid, ruby…) more than doubles the size.
    keepFeatures: ["ccmp", "locl", "kern", "palt", "vert", "vrt2", "vpal", "vkrn"],
    noHinting: true,
  };

  const [woff2, ttf] = await Promise.all([
    subsetFont(source, text, { ...options, targetFormat: "woff2" }),
    subsetFont(source, text, { ...options, targetFormat: "truetype" }),
  ]);

  await writeFile(path.join(fontsDir, "web/noto-serif-jp-accents.woff2"), woff2);
  await writeFile(path.join(fontsDir, "static/noto-serif-jp-accents.ttf"), ttf);

  console.warn(
    `Subset ${[...text].length} glyphs → woff2 ${(woff2.length / 1024).toFixed(1)} KB, ttf ${(ttf.length / 1024).toFixed(1)} KB`,
  );
}

await main();
