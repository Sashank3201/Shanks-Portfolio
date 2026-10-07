import { describe, expect, it } from "vitest";

import { detectTier } from "./quality";

const desktop = { coarsePointer: false, shortestScreenSide: 1080, cores: 8, memoryGb: 8 };

describe("quality tier detection", () => {
  it("gives capable desktops the top tier", () => {
    expect(detectTier(desktop)).toBe(3);
  });

  it("keeps modest desktops in the middle tier", () => {
    expect(detectTier({ ...desktop, cores: 4, memoryGb: 8 })).toBe(2);
  });

  it("starts phones conservatively", () => {
    expect(
      detectTier({ ...desktop, coarsePointer: true, shortestScreenSide: 390, memoryGb: 4 }),
    ).toBe(1);
    expect(
      detectTier({ ...desktop, coarsePointer: true, shortestScreenSide: 430, memoryGb: 8 }),
    ).toBe(2);
  });

  it("drops to the lowest tier on software or low-end renderers", () => {
    expect(detectTier({ ...desktop, renderer: "ANGLE (Google, Vulkan 1.3.0 (SwiftShader))" })).toBe(
      1,
    );
    expect(detectTier({ ...desktop, renderer: "Mali-G52 MC2" })).toBe(1);
  });
});
