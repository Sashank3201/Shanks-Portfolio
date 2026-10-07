"use client";

import { useRef } from "react";

import { gsap, KATAKANA_GLYPHS } from "@/lib/motion/gsap";
import { loadScrambleText } from "@/lib/motion/lazy-plugins";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cx } from "@/lib/utils/cx";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** `inView` plays once when scrolled into view; `hover` replays on pointer enter. */
  trigger?: "inView" | "hover";
  delay?: number;
  duration?: number;
}

/**
 * Text that decodes from katakana into its final form. Screen readers get the final text from a
 * visually hidden copy; the animated glyphs are aria-hidden.
 */
export function ScrambleText({
  text,
  className,
  trigger = "inView",
  delay = 0,
  duration = 1.2,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotionGSAP(
    ({ reduced, contextSafe }) => {
      const element = ref.current;
      if (!element || reduced) return;

      let active = true;
      const decode = contextSafe(() => {
        if (!active) return;
        gsap.to(element, {
          duration,
          delay,
          ease: "none",
          overwrite: "auto",
          scrambleText: { text, chars: KATAKANA_GLYPHS, revealDelay: 0.25, speed: 0.6 },
        });
      });
      const scramble = () => {
        void loadScrambleText().then(decode);
      };

      if (trigger === "hover") {
        const parent = element.parentElement ?? element;
        const onEnter = () => {
          scramble();
        };
        parent.addEventListener("pointerenter", onEnter);
        return () => {
          active = false;
          parent.removeEventListener("pointerenter", onEnter);
        };
      }

      // Hidden until it scrolls into view, then decodes in place.
      gsap.from(element, {
        opacity: 0,
        duration: 0.2,
        delay,
        scrollTrigger: { trigger: element, start: "top 90%", once: true, onEnter: scramble },
      });
      return () => {
        active = false;
      };
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <span className={cx("relative inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
