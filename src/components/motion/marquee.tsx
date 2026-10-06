"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/motion/gsap";
import { getLenis } from "@/lib/motion/scroll";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cn } from "@/lib/utils/cn";
import { damp } from "@/lib/utils/math";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Base speed in px/s. Negative runs right-to-left reversed. */
  speed?: number;
}

/**
 * Infinite marquee that reacts to scroll: it speeds up with scroll velocity and follows the
 * scroll direction. Position is integrated on gsap.ticker and wrapped, so it can run both ways
 * forever without tween seams. Under reduced motion it is a static row.
 */
export function Marquee({ children, className, speed = 60 }: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const track = trackRef.current;
      if (!track || reduced) return;

      let width = track.scrollWidth / 2;
      const observer = new ResizeObserver(() => {
        width = track.scrollWidth / 2;
      });
      observer.observe(track);

      const setX = gsap.quickSetter(track, "x", "px") as (value: number) => void;
      let x = 0;
      let direction = 1;
      let multiplier = 1;

      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.1);
        const velocity = getLenis()?.velocity ?? 0;
        if (Math.abs(velocity) > 0.1) direction = Math.sign(velocity);
        multiplier = damp(multiplier, 1 + Math.min(Math.abs(velocity) * 0.06, 5), 5, dt);
        x -= speed * direction * multiplier * dt;
        x = gsap.utils.wrap(-width, 0, x);
        setX(x);
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
