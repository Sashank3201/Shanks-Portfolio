"use client";

import { useRef } from "react";

import { path } from "@/content/home";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";

/**
 * The path: a crimson line descends the timeline with the scroll and each milestone ignites as
 * the line reaches it. Without JavaScript or under reduced motion the line is simply complete.
 */
export function PathTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = rootRef.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-path-item]", root);
      const unlight = () => {
        for (const item of items) item.removeAttribute("data-lit");
      };

      if (reduced) {
        for (const item of items) item.setAttribute("data-lit", "");
        return unlight;
      }

      gsap.fromTo(
        "[data-path-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        },
      );

      for (const item of items) {
        ScrollTrigger.create({
          trigger: item,
          start: "top 65%",
          end: "max",
          onToggle: ({ isActive }) => {
            item.toggleAttribute("data-lit", isActive);
          },
        });
      }

      return unlight;
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative mt-16 md:mt-24">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[7px] w-px bg-ash-900 md:left-[calc(12rem+7px)]"
      />
      <div
        aria-hidden="true"
        data-path-line
        className="absolute inset-y-0 left-[7px] w-px origin-top bg-accent shadow-[0_0_14px_var(--color-accent)] md:left-[calc(12rem+7px)]"
      />
      <ol className="space-y-16 md:space-y-24">
        {path.map((entry) => (
          <li
            key={entry.period}
            data-path-item
            className="group/path relative grid gap-3 pl-10 md:grid-cols-[12rem_1fr] md:gap-10 md:pl-0"
          >
            <p className="label text-ash-400 md:pt-2.5">{entry.period}</p>
            <div className="relative md:pl-12">
              <span
                aria-hidden="true"
                className="absolute top-2 -left-10 size-[15px] rotate-45 border border-accent bg-void transition-[background-color,box-shadow] duration-500 group-data-[lit]/path:bg-accent group-data-[lit]/path:shadow-[0_0_18px_var(--color-accent)]"
              />
              <h3 className="font-display text-title text-bone">{entry.role}</h3>
              <p className="mt-1 label text-accent">{entry.place}</p>
              <p className="mt-4 max-w-prose text-ash-200">{entry.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
