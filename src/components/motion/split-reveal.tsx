"use client";

import { useRef } from "react";

import { EASE, gsap, SplitText } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

type SplitUnit = "lines" | "words" | "chars";

const SPLIT_TYPE: Record<SplitUnit, string> = {
  lines: "lines",
  words: "lines,words",
  chars: "lines,words,chars",
};

const DEFAULT_STAGGER: Record<SplitUnit, number> = { lines: 0.09, words: 0.04, chars: 0.022 };

interface SplitRevealProps {
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4";
  children: string;
  id?: string;
  className?: string;
  /** Unit that rises out of the line masks. */
  by?: SplitUnit;
  delay?: number;
  stagger?: number;
  /** ScrollTrigger start; the reveal plays once. */
  start?: string;
}

/**
 * Text that rises out of masked lines when scrolled into view. Returning the tween from onSplit
 * lets autoSplit carry progress across re-splits (font load, resize).
 *
 * Accessibility: line splits keep whole words, so the element is split in place. Word and
 * character splits fragment the text, so assistive tech reads a visually hidden copy while the
 * animated copy is aria-hidden (aria-label is not permitted on generic/paragraph roles).
 */
export function SplitReveal({
  as = "div",
  children,
  id,
  className,
  by = "lines",
  delay = 0,
  stagger,
  start = "top 85%",
}: SplitRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const fragmented = by !== "lines";

  useMotionGSAP(
    ({ reduced }) => {
      const target = targetRef.current;
      if (!target || reduced) return;

      SplitText.create(target, {
        type: SPLIT_TYPE[by],
        mask: "lines",
        aria: "none",
        autoSplit: true,
        // GSAP docs: returning the animation lets autoSplit carry its progress across re-splits.
        // The bundled typings still declare `void`.
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSplit: (self) =>
          gsap.from(self[by], {
            yPercent: 115,
            duration: 1.15,
            ease: EASE.reiatsu,
            delay,
            stagger: stagger ?? DEFAULT_STAGGER[by],
            scrollTrigger: { trigger: target, start, once: true },
          }),
      });
    },
    { scope: rootRef },
  );

  const Tag = as;
  const setRoot = (node: HTMLElement | null) => {
    rootRef.current = node;
    if (!fragmented) targetRef.current = node;
  };
  const setTarget = (node: HTMLElement | null) => {
    targetRef.current = node;
  };

  return (
    <Tag ref={setRoot} id={id} className={className}>
      {fragmented ? (
        <>
          <span className="sr-only">{children}</span>
          <span ref={setTarget} aria-hidden="true" className="block">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
