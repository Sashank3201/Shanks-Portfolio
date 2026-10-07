"use client";

import { useRef } from "react";

import { CRESCENT_PATH, MASK_EYES_PATH, MASK_PATH } from "@/components/illustrations/logo-paths";
import { gsap } from "@/lib/motion/gsap";
import { loadMorphSVG } from "@/lib/motion/lazy-plugins";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cx } from "@/lib/utils/cx";
import { useUiStore } from "@/stores/ui-store";

type Shape = "crescent" | "mask";

/**
 * The header logo: a crescent in the Shinigami realm that morphs into the horned mask under
 * Release. The static shapes follow `html[data-release]` in CSS, so the right one paints before
 * hydration and is all there is under reduced motion; while the shape changes, a morph layer
 * takes over and hands back on completion. A reversal mid-morph continues from the current shape.
 */
export function LogoMark({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const generation = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const release = useUiStore((state) => state.release);

  useMotionGSAP(
    ({ reduced, contextSafe }) => {
      const svg = ref.current;
      const morph = svg?.querySelector<SVGPathElement>("[data-logo-morph]");
      const eyes = svg?.querySelector<SVGPathElement>("[data-logo-morph-eyes]");
      if (!svg || !morph || !eyes) return;

      const shape: Shape = release ? "mask" : "crescent";
      const path = release ? MASK_PATH : CRESCENT_PATH;
      const current = morph.dataset.shape;
      const run = ++generation.current;

      // First paint, reduced motion, or nothing to change: sync the morph layer silently.
      if (current === undefined || current === shape || reduced) {
        timeline.current?.kill();
        morph.setAttribute("d", path);
        morph.dataset.shape = shape;
        gsap.set(eyes, { opacity: release ? 1 : 0 });
        delete svg.dataset.morphing;
        if (!reduced) preloadWhenIdle();
        return;
      }

      svg.dataset.morphing = "";
      morph.dataset.shape = shape;

      const play = contextSafe(() => {
        if (run !== generation.current) return;
        timeline.current?.kill();
        timeline.current = gsap
          .timeline({
            onComplete: () => {
              delete svg.dataset.morphing;
            },
          })
          .to(morph, { morphSVG: path, duration: 0.9, ease: "expo.inOut" }, 0)
          .to(
            eyes,
            { opacity: release ? 1 : 0, duration: 0.3, ease: "power2.out" },
            release ? 0.7 : 0,
          );
      });
      // Without the plugin, cut straight to the new shape.
      const cut = contextSafe(() => {
        if (run !== generation.current) return;
        morph.setAttribute("d", path);
        gsap.set(eyes, { opacity: release ? 1 : 0 });
        delete svg.dataset.morphing;
      });

      loadMorphSVG().then(play, cut);
    },
    { scope: ref, dependencies: [release], revertOnUpdate: false },
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cx("logo-mark overflow-visible", className)}
    >
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.35" />
      <path className="logo-crescent" d={CRESCENT_PATH} fill="currentColor" />
      <g className="logo-mask">
        <path d={MASK_PATH} fill="currentColor" />
        <path d={MASK_EYES_PATH} className="fill-void" />
      </g>
      <g className="logo-morph">
        <path data-logo-morph d={CRESCENT_PATH} fill="currentColor" />
        <path data-logo-morph-eyes d={MASK_EYES_PATH} className="fill-void" opacity={0} />
      </g>
    </svg>
  );
}

/** Fetch MorphSVG once the page is idle, so the first Release morphs without waiting. */
function preloadWhenIdle() {
  const load = () => void loadMorphSVG().catch(() => undefined);
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 4000 });
  else setTimeout(load, 2000);
}
