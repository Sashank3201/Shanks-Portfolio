/**
 * The gothic spire (original design) as data: one source of truth for the WebGL signed distance
 * field (generated GLSL) and the SVG silhouette used without WebGL.
 *
 * Local units: base centre at the origin, y up, total height 1.0.
 */
export type SpirePart =
  | { kind: "box"; x: number; y: number; halfWidth: number; halfHeight: number; keep?: true }
  | { kind: "spike"; x: number; y: number; halfWidth: number; height: number };

export const SPIRE_PARTS: readonly SpirePart[] = [
  // Stepped keep and needle spire.
  { kind: "box", x: 0, y: 0.09, halfWidth: 0.16, halfHeight: 0.09 },
  { kind: "box", x: 0, y: 0.25, halfWidth: 0.115, halfHeight: 0.08 },
  { kind: "box", x: 0, y: 0.45, halfWidth: 0.075, halfHeight: 0.13, keep: true },
  { kind: "box", x: 0, y: 0.66, halfWidth: 0.045, halfHeight: 0.09 },
  { kind: "spike", x: 0, y: 0.74, halfWidth: 0.05, height: 0.26 },
  // Flanking towers.
  { kind: "box", x: -0.13, y: 0.22, halfWidth: 0.03, halfHeight: 0.22 },
  { kind: "spike", x: -0.13, y: 0.43, halfWidth: 0.036, height: 0.15 },
  { kind: "box", x: 0.13, y: 0.19, halfWidth: 0.028, halfHeight: 0.19 },
  { kind: "spike", x: 0.13, y: 0.37, halfWidth: 0.033, height: 0.13 },
  // Outer turrets.
  { kind: "box", x: -0.245, y: 0.1, halfWidth: 0.035, halfHeight: 0.1 },
  { kind: "spike", x: -0.245, y: 0.19, halfWidth: 0.042, height: 0.1 },
  { kind: "box", x: 0.255, y: 0.08, halfWidth: 0.03, halfHeight: 0.08 },
  { kind: "spike", x: 0.255, y: 0.15, halfWidth: 0.036, height: 0.09 },
  { kind: "box", x: -0.33, y: 0.045, halfWidth: 0.03, halfHeight: 0.045 },
  { kind: "box", x: 0.34, y: 0.035, halfWidth: 0.028, halfHeight: 0.035 },
  // Pinnacles.
  { kind: "spike", x: -0.09, y: 0.32, halfWidth: 0.012, height: 0.09 },
  { kind: "spike", x: 0.09, y: 0.32, halfWidth: 0.012, height: 0.09 },
  { kind: "spike", x: -0.06, y: 0.57, halfWidth: 0.01, height: 0.08 },
  { kind: "spike", x: 0.06, y: 0.57, halfWidth: 0.01, height: 0.08 },
];

/** Horizontal extent of the silhouette in local units (for SVG viewBoxes). */
export const SPIRE_HALF_WIDTH = 0.37;

const glslFloat = (value: number) => value.toFixed(4);

function partDistance(part: SpirePart): string {
  const offset = `p - vec2(${glslFloat(part.x)}, ${glslFloat(part.y)})`;
  return part.kind === "box"
    ? `sdBox(${offset}, vec2(${glslFloat(part.halfWidth)}, ${glslFloat(part.halfHeight)}))`
    : `sdSpike(${offset}, ${glslFloat(part.halfWidth)}, ${glslFloat(part.height)})`;
}

/** GLSL for `float spireSDF(vec2 p, out float keep)`; `keep` is the window-bearing section. */
export function spireGlsl(): string {
  const keepPart = SPIRE_PARTS.find((part) => part.kind === "box" && part.keep);
  const lines = SPIRE_PARTS.map((part) => `  d = min(d, ${partDistance(part)});`);
  return [
    "float spireSDF(vec2 p, out float keep) {",
    "  float d = 1e5;",
    `  keep = ${keepPart ? partDistance(keepPart) : "1e5"};`,
    ...lines,
    "  return d;",
    "}",
  ].join("\n");
}

const svgNumber = (value: number) => Number(value.toFixed(4)).toString();

/** SVG path data in local units with y flipped (SVG y grows downward): viewBox x ∈ ±0.37, y ∈ [-1, 0]. */
export function spireSvgPath(): string {
  return SPIRE_PARTS.map((part) => {
    if (part.kind === "box") {
      const left = svgNumber(part.x - part.halfWidth);
      const right = svgNumber(part.x + part.halfWidth);
      const top = svgNumber(-(part.y + part.halfHeight));
      const bottom = svgNumber(-(part.y - part.halfHeight));
      return `M${left} ${bottom}V${top}H${right}V${bottom}Z`;
    }
    const left = svgNumber(part.x - part.halfWidth);
    const right = svgNumber(part.x + part.halfWidth);
    const base = svgNumber(-part.y);
    const apex = svgNumber(-(part.y + part.height));
    return `M${left} ${base}L${svgNumber(part.x)} ${apex}L${right} ${base}Z`;
  }).join("");
}
