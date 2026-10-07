"use client";

import { useRef } from "react";

import { gsap, SplitText } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

interface ScrollWordsProps {
  as?: "p" | "div" | "h2" | "h3";
  children: string;
  className?: string;
}

/**
 * Words light up one by one as the passage scrolls through the viewport (scrubbed).
 * Assistive tech reads a visually hidden copy; the word-split copy is aria-hidden.
 */
export function ScrollWords({ as = "p", children, className }: ScrollWordsProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLSpanElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const target = targetRef.current;
      if (!target || reduced) return;

      SplitText.create(target, {
        type: "words",
        aria: "none",
        autoSplit: true,
        // GSAP docs: returning the animation lets autoSplit carry its progress across re-splits.
        // The bundled typings still declare `void`.
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSplit: (self) =>
          gsap.fromTo(
            self.words,
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: target, start: "top 80%", end: "bottom 50%", scrub: true },
            },
          ),
      });
    },
    { scope: rootRef },
  );

  const Tag = as;
  const setRoot = (node: HTMLElement | null) => {
    rootRef.current = node;
  };

  return (
    <Tag ref={setRoot} className={className}>
      <span className="sr-only">{children}</span>
      <span ref={targetRef} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
