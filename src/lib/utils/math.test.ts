import { describe, expect, it } from "vitest";

import { clamp, damp, invLerp, lerp, mapRange, smoothstep } from "./math";

describe("math utils", () => {
  it("clamps to the unit range by default", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.25)).toBe(0.25);
    expect(clamp(15, 10, 12)).toBe(12);
  });

  it("interpolates and inverts linearly", () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(invLerp(10, 20, 15)).toBe(0.5);
    expect(invLerp(5, 5, 5)).toBe(0);
  });

  it("maps between ranges with clamping", () => {
    expect(mapRange(50, 0, 100, 0, 1)).toBe(0.5);
    expect(mapRange(150, 0, 100, 0, 1)).toBe(1);
    expect(mapRange(0.5, 0, 1, 1, 0)).toBe(0.5);
  });

  it("damps toward the target independent of frame rate", () => {
    const oneStep = damp(0, 1, 4, 1 / 30);
    const twoSteps = damp(damp(0, 1, 4, 1 / 60), 1, 4, 1 / 60);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(damp(0, 1, 4, 10)).toBeCloseTo(1, 10);
  });

  it("matches GLSL smoothstep at the edges and midpoint", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
});
