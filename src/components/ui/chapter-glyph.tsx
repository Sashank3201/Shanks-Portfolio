"use client";

import { useRef } from "react";

import { gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cx } from "@/lib/utils/cx";

/**
 * A chapter's kanji, set enormous and outlined behind its opening like an anime title card. It
 * drifts against the scroll (parallax) while the chapter passes; still under reduced motion.
 * Decorative: the chapter's real heading carries the meaning.
 */
export function ChapterGlyph({ glyph, side }: { glyph: string; side: "left" | "right" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const element = ref.current;
      const chapter = element?.closest("section");
      if (!element || !chapter || reduced) return;
      gsap.fromTo(
        element,
        { yPercent: 18 },
        {
          yPercent: -22,
          ease: "none",
          scrollTrigger: { trigger: chapter, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      lang="ja"
      aria-hidden="true"
      className={cx(
        "chapter-glyph pointer-events-none absolute top-0 -z-10 font-jp leading-none select-none",
        side === "right" ? "-right-[0.06em]" : "-left-[0.06em]",
      )}
    >
      {glyph}
    </span>
  );
}
