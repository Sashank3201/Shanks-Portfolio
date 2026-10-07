"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

/** How far the doors fold back (scaleX), and how bright the light behind them gets. */
const OPEN_SCALE = 0.16;
const LIGHT = 1;

/**
 * The contact gate: as it scrolls into view its doors fold open onto crimson light, behind the
 * figure standing in the opening. Reduced motion shows it already open; without JavaScript the
 * doors stay shut.
 */
export function GateScene({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = ref.current;
      if (!root) return;
      const left = root.querySelector("[data-door='left']");
      const right = root.querySelector("[data-door='right']");
      const light = root.querySelector("[data-gate-light]");
      if (!left || !right || !light) return;

      if (reduced) {
        gsap.set(left, { scaleX: OPEN_SCALE, transformOrigin: "0% 50%" });
        gsap.set(right, { scaleX: OPEN_SCALE, transformOrigin: "100% 50%" });
        gsap.set(light, { opacity: LIGHT });
        return;
      }

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top 75%", end: "center 45%", scrub: 0.8 },
        })
        .to(left, { scaleX: OPEN_SCALE, transformOrigin: "0% 50%" }, 0)
        .to(right, { scaleX: OPEN_SCALE, transformOrigin: "100% 50%" }, 0)
        .to(light, { opacity: LIGHT }, 0.2);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
