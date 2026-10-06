"use client";

import { useRef, type ReactNode } from "react";

import { EASE, ScrollTrigger, gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed header behaviour: a scrim fades in once the page has scrolled (legibility over content),
 * and the bar slides away while reading down and returns on scroll up — or as soon as keyboard
 * focus enters it. Under reduced motion it simply stays put.
 */
export function HeaderShell({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const header = ref.current;
      if (!header) return;

      const reveal = gsap
        .from(header, { yPercent: -110, duration: 0.55, ease: EASE.reiatsu, paused: true })
        .progress(1);

      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const scrolled = self.scroll() > 24;
          header.dataset.scrolled = String(scrolled);
          if (reduced) return;
          if (self.scroll() < 240 || self.direction === -1) reveal.play();
          else reveal.reverse();
        },
      });

      const onFocusIn = () => {
        reveal.play();
      };
      header.addEventListener("focusin", onFocusIn);

      return () => {
        header.removeEventListener("focusin", onFocusIn);
        trigger.kill();
      };
    },
    { scope: ref },
  );

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-(--z-header)",
        "before:absolute before:inset-x-0 before:top-0 before:h-32 before:bg-linear-to-b before:from-void before:via-void/70 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500",
        "data-[scrolled=true]:before:opacity-100",
        className,
      )}
    >
      {children}
    </header>
  );
}
