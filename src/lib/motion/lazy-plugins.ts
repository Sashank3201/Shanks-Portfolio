import type { DrawSVGPlugin as DrawPlugin } from "gsap/DrawSVGPlugin";
import type { Flip as FlipPlugin } from "gsap/Flip";
import type { MorphSVGPlugin as MorphPlugin } from "gsap/MorphSVGPlugin";
import type { ScrambleTextPlugin as ScramblePlugin } from "gsap/ScrambleTextPlugin";

import { gsap } from "./gsap";

let morphSVG: Promise<typeof MorphPlugin> | undefined;
let flip: Promise<typeof FlipPlugin> | undefined;
let drawSVG: Promise<typeof DrawPlugin> | undefined;
let scrambleText: Promise<typeof ScramblePlugin> | undefined;

/** Loads and registers DrawSVG the first time a stroke is drawn. */
export function loadDrawSVG(): Promise<typeof DrawPlugin> {
  drawSVG ??= import("gsap/DrawSVGPlugin").then(({ DrawSVGPlugin }) => {
    gsap.registerPlugin(DrawSVGPlugin);
    return DrawSVGPlugin;
  });
  return drawSVG;
}

/** Loads and registers ScrambleText the first time text decodes. */
export function loadScrambleText(): Promise<typeof ScramblePlugin> {
  scrambleText ??= import("gsap/ScrambleTextPlugin").then(({ ScrambleTextPlugin }) => {
    gsap.registerPlugin(ScrambleTextPlugin);
    return ScrambleTextPlugin;
  });
  return scrambleText;
}

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
