import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "@/assets/fonts/jp-glyphs.json";

/** Kana, CJK punctuation, ideographs and full-width forms. */
const JAPANESE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/gu;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const srcDir = path.resolve(__dirname, "..");

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return collectFiles(full);
    return SOURCE_EXTENSIONS.has(path.extname(entry)) && !entry.endsWith(".test.ts") ? [full] : [];
  });
}

function subsetGlyphs(): Set<string> {
  // Fonts map code points to glyphs, so code-point (not grapheme) iteration is exactly right here.
  const glyphs = new Set(manifest.chars.flatMap((entry) => Array.from(entry.value)));
  for (const { from, to } of manifest.ranges) {
    for (let code = Number.parseInt(from, 16); code <= Number.parseInt(to, 16); code++) {
      glyphs.add(String.fromCodePoint(code));
    }
  }
  return glyphs;
}

describe("Japanese accent font subset", () => {
  it("contains every Japanese glyph used in the source", () => {
    const available = subsetGlyphs();
    const missing = new Map<string, string>();

    for (const file of collectFiles(srcDir)) {
      for (const [glyph] of readFileSync(file, "utf8").matchAll(JAPANESE)) {
        if (!available.has(glyph)) missing.set(glyph, path.relative(srcDir, file));
      }
    }

    // Add any reported glyph to src/assets/fonts/jp-glyphs.json and run `pnpm fonts:jp`.
    expect(Object.fromEntries(missing)).toEqual({});
  });
});
