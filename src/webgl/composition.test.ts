import { describe, expect, it } from "vitest";

import { computeComposition, toSky } from "./composition";

const viewport = { width: 1440, height: 900 };
const anchor = { docX: 720, docY: 306, radius: 240 };

describe("sky composition", () => {
  it("maps viewport pixels into sky space", () => {
    expect(toSky(720, 450, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(toSky(1440, 0, 1440, 900)).toEqual({ x: 0.8, y: 0.5 });
  });

  it("aligns the eclipse with the hero anchor at the top of the page", () => {
    const sky = computeComposition({ ...viewport, scroll: 0, docHeight: 5000, anchor });
    const expected = toSky(anchor.docX, anchor.docY, viewport.width, viewport.height);
    expect(sky.eclipseX).toBeCloseTo(expected.x);
    expect(sky.eclipseY).toBeCloseTo(expected.y);
    expect(sky.eclipseRadius).toBeCloseTo(anchor.radius / viewport.height);
    expect(sky.spireVisibility).toBe(1);
    expect(sky.beam).toBe(1);
  });

  it("puts the spire tip just below the eclipse", () => {
    const sky = computeComposition({ ...viewport, scroll: 0, docHeight: 5000, anchor });
    const tip = sky.spireBaseY + sky.spireScale;
    const ringBottom = sky.eclipseY - sky.eclipseRadius;
    expect(tip).toBeLessThan(ringBottom);
    expect(ringBottom - tip).toBeLessThan(0.05);
  });

  it("retires the spire and beam once the hero has scrolled away", () => {
    const sky = computeComposition({ ...viewport, scroll: 900, docHeight: 5000, anchor });
    expect(sky.spireVisibility).toBe(0);
    expect(sky.beam).toBe(0);
    expect(sky.eclipseRadius).toBeLessThan(anchor.radius / viewport.height);
  });

  it("grows into the finale crescent at the bottom of the page", () => {
    const middle = computeComposition({ ...viewport, scroll: 2000, docHeight: 5000, anchor });
    const end = computeComposition({ ...viewport, scroll: 4100, docHeight: 5000, anchor });
    expect(end.eclipseRadius).toBeGreaterThan(middle.eclipseRadius);
  });

  it("uses a calm resting composition on pages without an anchor", () => {
    const sky = computeComposition({ ...viewport, scroll: 0, docHeight: 2000, anchor: null });
    expect(sky.spireVisibility).toBe(0);
    expect(sky.eclipseX).toBeGreaterThan(0);
    expect(sky.eclipseY).toBeGreaterThan(0);
  });
});
