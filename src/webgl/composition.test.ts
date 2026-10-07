import { describe, expect, it } from "vitest";

import { computeComposition, coverRadius, toSky } from "./composition";

const viewport = { width: 1440, height: 900 };
const anchor = { docX: 720, docY: 306, radius: 240 };
const page = { ...viewport, scroll: 0, docHeight: 5000, anchor };

describe("sky composition", () => {
  it("maps viewport pixels into sky space", () => {
    expect(toSky(720, 450, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(toSky(1440, 0, 1440, 900)).toEqual({ x: 0.8, y: 0.5 });
  });

  it("aligns the eclipse with the hero anchor at the top of the page", () => {
    const sky = computeComposition(page);
    const expected = toSky(anchor.docX, anchor.docY, viewport.width, viewport.height);
    expect(sky.eclipseX).toBeCloseTo(expected.x);
    expect(sky.eclipseY).toBeCloseTo(expected.y);
    expect(sky.eclipseRadius).toBeCloseTo(anchor.radius / viewport.height);
    expect(sky.eclipseVisibility).toBe(1);
    expect(sky.spireVisibility).toBe(1);
    expect(sky.beam).toBe(1);
  });

  it("puts the spire tip just below the eclipse", () => {
    const sky = computeComposition(page);
    const tip = sky.spireBaseY + sky.spireScale;
    const ringBottom = sky.eclipseY - sky.eclipseRadius;
    expect(tip).toBeLessThan(ringBottom);
    expect(ringBottom - tip).toBeLessThan(0.05);
  });

  it("dives: the eclipse grows past the screen, centred, and the spire sinks away", () => {
    const halfway = computeComposition({ ...page, dive: 0.5 });
    const full = computeComposition({ ...page, dive: 1 });
    const halfDiagonal = 0.5 * Math.hypot(viewport.width / viewport.height, 1);

    expect(halfway.eclipseRadius).toBeGreaterThan(anchor.radius / viewport.height);
    expect(full.eclipseRadius).toBeCloseTo(coverRadius(viewport.width / viewport.height));
    expect(full.eclipseRadius * 0.95).toBeGreaterThan(halfDiagonal);
    expect(full.eclipseX).toBeCloseTo(0);
    expect(full.eclipseY).toBeCloseTo(0);
    expect(full.spireVisibility).toBe(0);
    expect(full.beam).toBe(0);
  });

  it("re-emerges small at rest, fading back in", () => {
    const start = computeComposition({ ...page, dive: 1, emerge: 0.05 });
    const done = computeComposition({ ...page, dive: 1, emerge: 1 });
    expect(start.eclipseVisibility).toBeLessThan(0.05);
    expect(done.eclipseVisibility).toBe(1);
    expect(done.eclipseRadius).toBeLessThan(anchor.radius / viewport.height);
    expect(done.eclipseX).toBeGreaterThan(0);
    expect(done.spireVisibility).toBe(0);
  });

  it("grows into the finale crescent at the bottom of the page", () => {
    const after = { ...page, dive: 1, emerge: 1 };
    const middle = computeComposition({ ...after, scroll: 2000 });
    const end = computeComposition({ ...after, scroll: 4100 });
    expect(end.eclipseRadius).toBeGreaterThan(middle.eclipseRadius);
  });

  it("uses a calm resting composition on pages without an anchor", () => {
    const sky = computeComposition({ ...viewport, scroll: 0, docHeight: 2000, anchor: null });
    expect(sky.spireVisibility).toBe(0);
    expect(sky.eclipseVisibility).toBe(1);
    expect(sky.eclipseX).toBeGreaterThan(0);
    expect(sky.eclipseY).toBeGreaterThan(0);
  });
});
