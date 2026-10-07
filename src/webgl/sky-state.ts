import { lerp, smoothstep } from "@/lib/utils/math";

/**
 * Where the moon sits this frame, in sky space (origin at the viewport centre, y up, 1 unit =
 * viewport height). Written by the sky every frame, read by layers drawn over it — ash and
 * embers behind the disc fade out so the moon reads as a void.
 *
 * Mirrors the moon in `shaders/sky.ts`: keep `moonCircle` and the shader in step.
 */
export const skyState = { moonX: 0, moonY: 0, moonRadius: 0, aspect: 1 };

/** The occluding moon for an eclipse at (x, y, radius), given the realm and dive progress. */
export function moonCircle(x: number, y: number, radius: number, realm: number, dive: number) {
  const turn = smoothstep(0.15, 1, realm);
  const centring = 1 - smoothstep(0.4, 1, dive);
  return {
    x: x + lerp(0.07, -0.22, turn) * radius * centring,
    y: y + lerp(0.05, 0.12, turn) * radius * centring,
    radius: radius * lerp(0.965, 0.95, realm),
  };
}
