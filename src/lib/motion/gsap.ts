import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * The single place core GSAP plugins are registered: only what most pages need immediately.
 * Everything else (DrawSVG, ScrambleText, MorphSVG, Flip) loads on demand via `./lazy-plugins`
 * or inside lazily imported sequences (preloader, hero intro).
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Lenis is driven from gsap.ticker; lag smoothing would desync scroll and animation after a stall.
gsap.ticker.lagSmoothing(0);
// Mobile URL-bar show/hide should not trigger full ScrollTrigger refreshes.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Named eases. Built-in GSAP curves matching the CSS tokens: --ease-reiatsu is easeOutQuint
 * (power4.out), --ease-slash is easeInOutExpo, --ease-drift is easeInOutSine.
 */
export const EASE = {
  reiatsu: "power4.out",
  slash: "expo.inOut",
  drift: "sine.inOut",
} as const;

/** Glyph pool for scramble effects: the katakana bundled in the Japanese accent subset. */
export const KATAKANA_GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

export { gsap, ScrollTrigger, SplitText, useGSAP };
