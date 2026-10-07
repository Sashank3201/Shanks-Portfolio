/** Small, allocation-free math helpers shared by the motion and WebGL layers. */

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Inverse of {@link lerp}: where `value` sits between `from` and `to`, unclamped. */
export function invLerp(from: number, to: number, value: number): number {
  return from === to ? 0 : (value - from) / (to - from);
}

/** Remaps `value` from one range to another, clamped to the output range. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return lerp(outMin, outMax, clamp(invLerp(inMin, inMax, value)));
}

/**
 * Frame-rate independent exponential smoothing. `lambda` is the decay rate per second;
 * higher values converge faster. Use instead of a fixed `lerp(a, b, 0.1)` inside render loops.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  deltaSeconds: number,
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * deltaSeconds));
}

/** Hermite smoothstep, matching GLSL's `smoothstep`. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp(invLerp(edge0, edge1, x));
  return t * t * (3 - 2 * t);
}
