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

/**
 * The gothic spire (original design): a stepped keep with a needle spire, flanking towers,
 * outer turrets and pinnacles. Local units: base centre at the origin, total height 1.0.
 * `keep` returns the distance to the window-bearing section of the keep.
 */
export const spireChunk = /* glsl */ `
float spireSDF(vec2 p, out float keep) {
  float d = sdBox(p - vec2(0.0, 0.09), vec2(0.16, 0.09));
  d = min(d, sdBox(p - vec2(0.0, 0.25), vec2(0.115, 0.08)));
  keep = sdBox(p - vec2(0.0, 0.45), vec2(0.075, 0.13));
  d = min(d, keep);
  d = min(d, sdBox(p - vec2(0.0, 0.66), vec2(0.045, 0.09)));
  d = min(d, sdSpike(p - vec2(0.0, 0.74), 0.05, 0.26));

  d = min(d, sdBox(p - vec2(-0.13, 0.22), vec2(0.03, 0.22)));
  d = min(d, sdSpike(p - vec2(-0.13, 0.43), 0.036, 0.15));
  d = min(d, sdBox(p - vec2(0.13, 0.19), vec2(0.028, 0.19)));
  d = min(d, sdSpike(p - vec2(0.13, 0.37), 0.033, 0.13));

  d = min(d, sdBox(p - vec2(-0.245, 0.1), vec2(0.035, 0.1)));
  d = min(d, sdSpike(p - vec2(-0.245, 0.19), 0.042, 0.1));
  d = min(d, sdBox(p - vec2(0.255, 0.08), vec2(0.03, 0.08)));
  d = min(d, sdSpike(p - vec2(0.255, 0.15), 0.036, 0.09));
  d = min(d, sdBox(p - vec2(-0.33, 0.045), vec2(0.03, 0.045)));
  d = min(d, sdBox(p - vec2(0.34, 0.035), vec2(0.028, 0.035)));

  d = min(d, sdSpike(p - vec2(-0.09, 0.32), 0.012, 0.09));
  d = min(d, sdSpike(p - vec2(0.09, 0.32), 0.012, 0.09));
  d = min(d, sdSpike(p - vec2(-0.06, 0.57), 0.01, 0.08));
  d = min(d, sdSpike(p - vec2(0.06, 0.57), 0.01, 0.08));
  return d;
}
`;
