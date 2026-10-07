import { describe, expect, it } from "vitest";

import { arcPath, polar } from "./arc";

describe("arc helpers", () => {
  it("measures angles clockwise from 12 o'clock", () => {
    const top = polar(100, 100, 50, 0);
    const right = polar(100, 100, 50, 90);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);
    expect(right.x).toBeCloseTo(150);
    expect(right.y).toBeCloseTo(100);
  });

  it("draws a clockwise arc, flagging the large sweep past 180°", () => {
    expect(arcPath(100, 100, 50, 0, 90)).toBe("M100.00 50.00A50.00 50.00 0 0 1 150.00 100.00");
    expect(arcPath(100, 100, 50, 0, 270)).toContain(" 0 1 1 ");
  });
});
