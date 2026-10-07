"use client";

import { useRef, type ReactNode } from "react";

import { EASE, gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds between children. */
  stagger?: number;
}

/**
 * Its children rise into place, one after another, the first time it scrolls into view.
 * Static under reduced motion and without JavaScript.
 */
export function Reveal({ children, className, stagger = 0.14 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = ref.current;
      if (!root || reduced || root.children.length === 0) return;
      gsap.from(root.children, {
        y: 56,
        autoAlpha: 0,
        duration: 1.3,
        ease: EASE.reiatsu,
        stagger,
        scrollTrigger: { trigger: root, start: "top 82%", once: true },
      });
    },
    { scope: ref, dependencies: [stagger] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
