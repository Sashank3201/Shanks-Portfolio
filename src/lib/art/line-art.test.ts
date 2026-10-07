import { describe, expect, it } from "vitest";

import { chain, crack, lineTo, strands, tatteredEdge } from "./line-art";

const numbers = (path: string) => path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];

describe("tatteredEdge", () => {
  const options = { depth: [10, 30], width: [8, 18], seed: 4 } as const;
  const hem = tatteredEdge({ x: 0, y: 100 }, { x: 200, y: 100 }, options);

  it("is deterministic and spans the edge", () => {
    expect(tatteredEdge({ x: 0, y: 100 }, { x: 200, y: 100 }, options)).toEqual(hem);
    expect(hem.at(-1)?.x).toBeCloseTo(200);
    for (const point of hem) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(200.01);
    }
  });

  it("hangs shreds below a left-to-right edge, never deeper than asked", () => {
    expect(Math.max(...hem.map((p) => p.y))).toBeGreaterThan(110);
    expect(Math.max(...hem.map((p) => p.y))).toBeLessThanOrEqual(130.01);
    expect(Math.min(...hem.map((p) => p.y))).toBeGreaterThanOrEqual(100);
  });

  it("joins into path segments", () => {
    expect(lineTo(hem.slice(0, 2))).toMatch(/^L[\d.]+ [\d.]+L[\d.]+ [\d.]+$/);
  });
});

describe("strands", () => {
  const options = {
    count: 6,
    angle: 180,
    spread: 30,
    length: [40, 80],
    width: [6, 10],
    curl: 20,
    seed: 9,
  } as const;

  it("draws one closed, finite lock per strand, deterministically", () => {
    const locks = strands({ x: 100, y: 50 }, { x: 120, y: 90 }, options);
    expect(locks).toHaveLength(6);
    expect(strands({ x: 100, y: 50 }, { x: 120, y: 90 }, options)).toEqual(locks);
    for (const lock of locks) {
      expect(lock).toMatch(/^M.*Q.*Q.*Z$/);
      expect(numbers(lock).every(Number.isFinite)).toBe(true);
    }
  });

  it("flows in the asked direction", () => {
    const [lock] = strands(
      { x: 100, y: 50 },
      { x: 100, y: 50 },
      { ...options, count: 1, spread: 0 },
    );
    const xs = numbers(lock ?? "").filter((_, index) => index % 2 === 0);
    expect(Math.min(...xs)).toBeLessThan(70);
  });
});

describe("chain", () => {
  it("spaces links evenly along the path, alternating face-on and edge-on", () => {
    const links = chain(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
      ],
      10,
      6,
    );
    expect(links).toHaveLength(15);
    expect(links[0]).toMatchObject({ cx: 5, cy: 0, angle: 0 });
    expect(links.at(-1)).toMatchObject({ cx: 100, angle: 90 });
    expect(links[0]?.ry).toBeGreaterThan(links[1]?.ry ?? Infinity);
  });
});

describe("crack", () => {
  it("is deterministic, finite and roughly as long as asked", () => {
    const options = {
      length: 60,
      angle: 90,
      step: [6, 12],
      jitter: 30,
      branching: 0.4,
      seed: 2,
    } as const;
    const path = crack({ x: 10, y: 10 }, options);
    expect(crack({ x: 10, y: 10 }, options)).toBe(path);
    expect(path.startsWith("M10.0 10.0L")).toBe(true);
    expect(numbers(path).every(Number.isFinite)).toBe(true);
    const ys = numbers(path).filter((_, index) => index % 2 === 1);
    expect(Math.max(...ys)).toBeGreaterThan(40);
  });
});
