import { spireGlsl } from "@/lib/scene/spire-geometry";

/**
 * 2D signed distance primitives after Inigo Quilez (MIT License).
 * https://iquilezles.org/articles/distfunctions2d/
 */
export const sdfChunk = /* glsl */ `
float sdBox(vec2 p, vec2 halfSize) {
  vec2 d = abs(p) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

/** Isosceles triangle with its base on y = 0 (from -halfWidth to +halfWidth), apex at y = height. */
float sdSpike(vec2 p, float halfWidth, float height) {
  vec2 q = vec2(halfWidth, height);
  p.x = abs(p.x);
  p.y = height - p.y;
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  float s = -sign(q.y);
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}
`;

/** The gothic spire's distance field, generated from the shared geometry data. */
export const spireChunk = spireGlsl();
