import { describe, expect, it } from "vitest";

import { SPIRE_HALF_WIDTH, SPIRE_PARTS, spireGlsl, spireSvgPath } from "./spire-geometry";

describe("spire geometry", () => {
  it("is exactly one unit tall", () => {
    const top = Math.max(
      ...SPIRE_PARTS.map((part) =>
        part.kind === "box" ? part.y + part.halfHeight : part.y + part.height,
      ),
    );
    expect(top).toBeCloseTo(1, 6);
  });

  it("fits inside the declared half width", () => {
    for (const part of SPIRE_PARTS) {
      expect(Math.abs(part.x) + part.halfWidth).toBeLessThanOrEqual(SPIRE_HALF_WIDTH);
    }
  });

  it("emits GLSL with float literals and a keep section", () => {
    const glsl = spireGlsl();
    expect(glsl).toContain("float spireSDF(vec2 p, out float keep)");
    expect(glsl).toContain("keep = sdBox(p - vec2(0.0000, 0.4500), vec2(0.0750, 0.1300));");
    // Every numeric literal must carry a decimal point (GLSL ES has no implicit int → float).
    expect(glsl.match(/[^\w.]\d+(?![\d.e])/g) ?? []).toEqual([]);
  });

  it("emits one closed SVG subpath per part", () => {
    const path = spireSvgPath();
    expect(path.match(/M/g)).toHaveLength(SPIRE_PARTS.length);
    expect(path.match(/Z/g)).toHaveLength(SPIRE_PARTS.length);
  });
});
