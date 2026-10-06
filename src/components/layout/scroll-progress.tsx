"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { ScrollTrigger } from "@/lib/motion/gsap";
import { scrollToTarget } from "@/lib/motion/scroll";
import { isMotionReduced } from "@/stores/ui-store";

/**
 * Back-to-top button whose ring fills with scroll progress — a waxing crescent in the corner.
 * Fades in once the visitor has left the first screen.
 */
export function ScrollProgress() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const button = buttonRef.current;
    const arc = arcRef.current;
    if (!button || !arc) return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        arc.style.strokeDashoffset = String(1 - self.progress);
        button.dataset.visible = String(self.scroll() > window.innerHeight * 0.6);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [pathname]);

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Back to top"
      data-visible="false"
      onClick={() => {
        scrollToTarget(0, { immediate: isMotionReduced() });
      }}
      className="fixed right-(--gutter) bottom-6 z-(--z-header) grid size-12 place-items-center rounded-full text-ash-200 transition-[opacity,translate,color] duration-500 ease-reiatsu hover:text-bone data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-3 data-[visible=false]:opacity-0"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="24" cy="24" r="22" fill="none" strokeWidth="1" className="stroke-ash-800" />
        <circle
          ref={arcRef}
          cx="24"
          cy="24"
          r="22"
          fill="none"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="stroke-accent"
        />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path d="M12 5v14M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
