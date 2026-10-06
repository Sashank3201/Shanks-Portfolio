"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cn } from "@/lib/utils/cn";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer offset the element follows (0–1). */
  strength?: number;
}

/** Pulls its child toward the pointer and snaps back elastically. Fine pointers only. */
export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const element = ref.current;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (!element || reduced || !finePointer) return;

      const xTo = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });
      let centerX = 0;
      let centerY = 0;

      // Measure once per hover, compensating for the current offset, so moves never read layout.
      const onEnter = () => {
        const rect = element.getBoundingClientRect();
        centerX = rect.left + rect.width / 2 - Number(gsap.getProperty(element, "x"));
        centerY = rect.top + rect.height / 2 - Number(gsap.getProperty(element, "y"));
      };
      const onMove = (event: PointerEvent) => {
        xTo((event.clientX - centerX) * strength);
        yTo((event.clientY - centerY) * strength);
      };
      const onLeave = () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
      };

      element.addEventListener("pointerenter", onEnter);
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointerenter", onEnter);
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
