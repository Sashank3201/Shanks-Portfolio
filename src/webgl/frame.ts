import { getLenis } from "@/lib/motion/scroll";

/** Current scroll offset (CSS px): Lenis' animated value when running, else native. */
export function getScroll(): number {
  return getLenis()?.scroll ?? window.scrollY;
}

/** Fixed clock value used for frozen (static / reduced-motion) frames, so they are repeatable. */
export const FROZEN_TIME = 12;

let frameRequested = true;

/** Ask the stage to render a frame even when it is idling (reduced motion, static mode). */
export function requestStageFrame(): void {
  frameRequested = true;
}

/** Consumes a pending frame request. */
export function takeFrameRequest(): boolean {
  const requested = frameRequested;
  frameRequested = false;
  return requested;
}

/** Deterministic PRNG, so particle fields are identical across loads and tests. */
export { seededRandom } from "@/lib/art/random";
