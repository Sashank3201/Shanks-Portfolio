"use client";

import { useRef, type CSSProperties } from "react";

import { gsap, SplitText } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { sceneSignal } from "@/lib/scene/scene-signal";
import { cx } from "@/lib/utils/cx";
import { useUiStore } from "@/stores/ui-store";

/** How far (as a share of the viewport width) the pointer's pull on a letter reaches. */
const REACH = 0.32;

/** Share of the dive over which the letters scatter. */
const SCATTER_SPAN = 0.75;

/**
 * The hero's name, set huge. Letters near the pointer lift and ignite in the realm's accent;
 * during the hero's dive they scatter outward and fade. Split only once the entrance (if any)
 * has finished, so it never fights the intro's own split. Static under reduced motion.
 */
export function HeroName({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const bootPhase = useUiStore((state) => state.bootPhase);

  useMotionGSAP(
    ({ reduced }) => {
      const title = ref.current;
      if (!title || reduced || bootPhase !== "ready") return;

      const split = SplitText.create(title, { type: "chars", charsClass: "hero-char" });
      const chars = split.chars as HTMLElement[];
      const centre = (chars.length - 1) / 2;

      // The dive: letters fly apart from the middle as the camera falls into the eclipse. Driven
      // by the dive itself (already scrubbed by the hero's pin), so the two never drift apart.
      const scatter = gsap.to(chars, {
        xPercent: (index: number) => (index - centre) * 55,
        yPercent: (index: number) => -60 - Math.abs(index - centre) * 25 - (index % 2) * 30,
        rotation: (index: number) => (index - centre) * 7,
        opacity: 0,
        ease: "power2.in",
        stagger: { each: 0.03, from: "center" },
        paused: true,
      });
      let scattered = -1;
      const followDive = () => {
        const progress = Math.min(sceneSignal.dive / SCATTER_SPAN, 1);
        if (progress === scattered) return;
        scattered = progress;
        scatter.progress(progress);
      };
      gsap.ticker.add(followDive);

      // (The split and the scatter are reverted with the context.)
      if (!window.matchMedia("(pointer: fine)").matches) {
        return () => {
          gsap.ticker.remove(followDive);
        };
      }

      // The pull: letters near the pointer lift and ignite.
      const ignite = chars.map((char) =>
        gsap.quickTo(char, "--ignite", { duration: 0.6, ease: "power3.out" }),
      );
      const lift = chars.map((char) =>
        gsap.quickTo(char, "y", { duration: 0.7, ease: "power3.out" }),
      );
      let pointerX = Number.NEGATIVE_INFINITY;
      let pointerY = Number.NEGATIVE_INFINITY;
      let frame = 0;

      const update = () => {
        frame = 0;
        const reach = window.innerWidth * REACH;
        chars.forEach((char, index) => {
          const rect = char.getBoundingClientRect();
          const distance = Math.hypot(
            pointerX - (rect.left + rect.width / 2),
            pointerY - (rect.top + rect.height / 2),
          );
          const k = Math.max(0, 1 - distance / reach);
          const pull = k * k * (3 - 2 * k);
          ignite[index]?.(pull);
          lift[index]?.(-pull * rect.height * 0.07);
        });
      };
      const onMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        frame ||= requestAnimationFrame(update);
      };
      const onLeave = () => {
        pointerX = pointerY = Number.NEGATIVE_INFINITY;
        frame ||= requestAnimationFrame(update);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      return () => {
        gsap.ticker.remove(followDive);
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref, dependencies: [bootPhase] },
  );

  return (
    <h1
      ref={ref}
      id="hero-title"
      data-hero-title
      style={{ "--name-chars": Math.max(name.length, 4) } as CSSProperties}
      className={cx("hero-name font-display font-medium glow", className)}
    >
      {name}
    </h1>
  );
}
