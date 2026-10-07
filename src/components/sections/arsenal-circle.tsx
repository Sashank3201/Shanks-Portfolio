"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

/** The sealing circle's centre in its viewBox. */
const ORIGIN = "400 400";

/**
 * Behaviour for the Arsenal's sealing circle: the rings turn slowly (the outer with the scroll as
 * well, the inner star against it), and pointing at a skill group — in the circle or in the list
 * beside it — lights that group's arc. Still under reduced motion.
 */
export function ArsenalCircle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = ref.current;
      if (!root) return;

      const onOver = (event: PointerEvent) => {
        const target = (event.target as Element).closest<HTMLElement | SVGElement>(
          "[data-group], [data-arc]",
        );
        const index = target?.dataset.group ?? target?.dataset.arc;
        if (index === undefined) delete root.dataset.active;
        else root.dataset.active = index;
      };
      const onLeave = () => {
        delete root.dataset.active;
      };
      root.addEventListener("pointerover", onOver);
      root.addEventListener("pointerleave", onLeave);

      if (!reduced) {
        gsap.to("[data-ring-spin]", {
          rotation: 360,
          svgOrigin: ORIGIN,
          duration: 200,
          repeat: -1,
          ease: "none",
        });
        gsap.to("[data-ring-counter]", {
          rotation: -360,
          svgOrigin: ORIGIN,
          duration: 260,
          repeat: -1,
          ease: "none",
        });
        gsap.fromTo(
          "[data-ring-scroll]",
          { rotation: -50, svgOrigin: ORIGIN },
          {
            rotation: 50,
            svgOrigin: ORIGIN,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      return () => {
        root.removeEventListener("pointerover", onOver);
        root.removeEventListener("pointerleave", onLeave);
        delete root.dataset.active;
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
