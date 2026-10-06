import type { Flip as FlipPlugin } from "gsap/Flip";
import type { MorphSVGPlugin as MorphPlugin } from "gsap/MorphSVGPlugin";

import { gsap } from "./gsap";

let morphSVG: Promise<typeof MorphPlugin> | undefined;
let flip: Promise<typeof FlipPlugin> | undefined;

/** Loads and registers MorphSVG the first time it is needed (e.g. the Release logo morph). */
export function loadMorphSVG(): Promise<typeof MorphPlugin> {
  morphSVG ??= import("gsap/MorphSVGPlugin").then(({ MorphSVGPlugin }) => {
    gsap.registerPlugin(MorphSVGPlugin);
    return MorphSVGPlugin;
  });
  return morphSVG;
}

/** Loads and registers Flip the first time it is needed (e.g. opening a project). */
export function loadFlip(): Promise<typeof FlipPlugin> {
  flip ??= import("gsap/Flip").then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });
  return flip;
}
