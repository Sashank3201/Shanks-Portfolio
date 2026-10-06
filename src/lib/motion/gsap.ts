import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * The single place GSAP plugins are registered. Plugins needed on first paint live here;
 * heavier, interaction-only plugins (MorphSVG, Flip) load on demand from `./lazy-plugins`.
 */
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  ScrambleTextPlugin,
  CustomEase,
);

// Lenis is driven from gsap.ticker; lag smoothing would desync scroll and animation after a stall.
gsap.ticker.lagSmoothing(0);
// Mobile URL-bar show/hide should not trigger full ScrollTrigger refreshes.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Named eases, mirroring the CSS tokens --ease-reiatsu / --ease-slash / --ease-drift. */
export const EASE = {
  reiatsu: "reiatsu",
  slash: "slash",
  drift: "drift",
} as const;

CustomEase.create(EASE.reiatsu, "0.22, 1, 0.36, 1");
CustomEase.create(EASE.slash, "0.87, 0, 0.13, 1");
CustomEase.create(EASE.drift, "0.37, 0, 0.63, 1");

/** Glyph pool for scramble effects: the katakana bundled in the Japanese accent subset. */
export const KATAKANA_GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

export { gsap, ScrollTrigger, SplitText, useGSAP };
