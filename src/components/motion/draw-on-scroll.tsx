"use client";

import { useRef, type ReactNode } from "react";

import { EASE, gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { loadDrawSVG } from "@/lib/motion/lazy-plugins";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

interface DrawOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Tie the drawing to the scroll position instead of playing it once on entry. */
  scrub?: boolean;
  /** Seconds for the whole drawing when it plays once. */
  duration?: number;
  /** ScrollTrigger start, and the end of the scrubbed range. */
  start?: string;
  end?: string;
}

/**
 * Draws the `[data-draw]` strokes of the SVG art inside it as it scrolls into view, then lets
 * their fills — and any `[data-draw-fade]` details — settle in. The art is complete without
 * JavaScript and under reduced motion; DrawSVG is only downloaded when there is something to draw.
 */
export function DrawOnScroll({
  children,
  className,
  scrub = false,
  duration = 2.4,
  start = "top 80%",
  end = "center 55%",
}: DrawOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced, contextSafe }) => {
      const root = ref.current;
      if (!root || reduced) return;
      const strokes = gsap.utils.toArray<SVGGraphicsElement>("[data-draw]", root);
      if (strokes.length === 0) return;
      const details = gsap.utils.toArray<SVGGraphicsElement>("[data-draw-fade]", root);

      let active = true;
      // Hidden until the plugin is in, so the art never flashes complete before it draws.
      gsap.set(root, { autoAlpha: 0 });

      const build = contextSafe(() => {
        if (!active) return;
        const stagger = { amount: duration * 0.35 };
        const timeline = gsap.timeline({
          paused: !scrub,
          scrollTrigger: scrub ? { trigger: root, start, end, scrub: 0.8 } : undefined,
        });
        // Strokes stay hidden until their turn: a zero-length dash still paints round caps.
        timeline
          .fromTo(strokes, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger }, 0)
          .fromTo(
            strokes,
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: duration * 0.65, ease: "power2.inOut", stagger },
            0,
          )
          .fromTo(
            strokes,
            { fillOpacity: 0 },
            { fillOpacity: 1, duration: duration * 0.3, ease: EASE.drift },
            duration * 0.7,
          );
        if (details.length > 0) {
          timeline.fromTo(details, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, "<");
        }
        gsap.set(root, { autoAlpha: 1 });

        if (!scrub) {
          ScrollTrigger.create({
            trigger: root,
            start,
            once: true,
            onEnter: () => {
              timeline.play();
            },
          });
        }
      });

      // If the plugin cannot load, show the finished art rather than nothing.
      const reveal = contextSafe(() => {
        if (active) gsap.set(root, { autoAlpha: 1 });
      });

      loadDrawSVG().then(build, reveal);

      return () => {
        active = false;
      };
    },
    { scope: ref, dependencies: [scrub, duration, start, end] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
