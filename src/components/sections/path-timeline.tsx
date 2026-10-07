"use client";

import { useEffect, useRef, useState } from "react";

import { path } from "@/content/home";
import { lightningBolt, type Bolt } from "@/lib/art/bolt";
import { gsap } from "@/lib/motion/gsap";
import { loadDrawSVG } from "@/lib/motion/lazy-plugins";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { cx } from "@/lib/utils/cx";

interface BoltLayout {
  width: number;
  height: number;
  bolt: Bolt;
  /** Each milestone's position down the bolt (0…1). */
  stops: number[];
}

/**
 * The path: a jagged lightning bolt runs down the timeline through every milestone and draws
 * itself with the scroll; each milestone ignites — fork, node and its huge outlined year — as
 * the bolt reaches it. Without JavaScript the milestones stand alone; under reduced motion the
 * bolt is simply there, every milestone lit.
 */
export function PathTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<BoltLayout | null>(null);

  // The bolt is drawn in the column's own pixels, through each milestone's measured centre.
  useEffect(() => {
    const root = rootRef.current;
    const box = boxRef.current;
    if (!root || !box) return;
    const measure = () => {
      const area = box.getBoundingClientRect();
      if (area.height === 0) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-path-item]"), (item) => {
        const rect = item.getBoundingClientRect();
        return { x: area.width / 2, y: rect.top + rect.height / 2 - area.top };
      });
      setLayout({
        width: area.width,
        height: area.height,
        bolt: lightningBolt(area.width, area.height, nodes),
        stops: nodes.map((node) => node.y / area.height),
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, []);

  useMotionGSAP(
    ({ reduced, contextSafe }) => {
      const root = rootRef.current;
      const main = root?.querySelector<SVGPathElement>("[data-bolt]");
      if (!root || !main || !layout) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-path-item]", root);
      const forks = gsap.utils.toArray<SVGPathElement>("[data-bolt-fork]", root);
      const light = (index: number, lit: boolean) => items[index]?.toggleAttribute("data-lit", lit);
      const unlightAll = () => {
        items.forEach((_, index) => light(index, false));
      };

      if (reduced) {
        items.forEach((_, index) => light(index, true));
        return unlightAll;
      }

      let active = true;
      // Hidden until DrawSVG is in, so the bolt never flashes complete before it draws.
      gsap.set([main, ...forks], { autoAlpha: 0 });

      const build = contextSafe(() => {
        if (!active) return;
        gsap.set(forks, { drawSVG: "0%", autoAlpha: 1 });
        gsap.set(main, { autoAlpha: 1 });
        gsap.fromTo(
          main,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 65%",
              end: "bottom 65%",
              scrub: 0.5,
              onUpdate: ({ progress }) => {
                layout.stops.forEach((stop, index) => {
                  const lit = progress >= stop;
                  if (lit === items[index]?.hasAttribute("data-lit")) return;
                  light(index, lit);
                  const fork = forks[index];
                  if (!fork) return;
                  gsap.to(fork, {
                    drawSVG: lit ? "100%" : "0%",
                    duration: lit ? 0.45 : 0.25,
                    ease: "power3.out",
                    overwrite: true,
                  });
                });
              },
            },
          },
        );
      });
      // If DrawSVG cannot load, show the finished bolt with every milestone lit.
      const reveal = contextSafe(() => {
        if (!active) return;
        gsap.set([main, ...forks], { autoAlpha: 1 });
        items.forEach((_, index) => light(index, true));
      });
      loadDrawSVG().then(build, reveal);

      return () => {
        active = false;
        unlightAll();
      };
    },
    { scope: rootRef, dependencies: [layout] },
  );

  return (
    <div ref={rootRef} className="relative mt-16 md:mt-24">
      <div
        ref={boxRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-14 md:left-1/2 md:w-44 md:-translate-x-1/2"
      >
        {layout && (
          <svg
            viewBox={`0 0 ${layout.width.toFixed(1)} ${layout.height.toFixed(1)}`}
            width={layout.width}
            height={layout.height}
            fill="none"
            stroke="currentColor"
            className="path-bolt absolute inset-0 overflow-visible text-accent"
          >
            <path data-bolt d={layout.bolt.main} strokeWidth={2} strokeLinejoin="miter" />
            {layout.bolt.forks.map((fork) => (
              <path key={fork} data-bolt-fork d={fork} strokeWidth={1.2} strokeLinecap="round" />
            ))}
          </svg>
        )}
      </div>

      <ol className="relative space-y-16 md:space-y-0">
        {path.map((entry, index) => {
          const year = entry.period.split(" ")[0] ?? entry.period;
          return (
            <li
              key={entry.period}
              data-path-item
              className="group/path path-item relative pl-20 md:grid md:min-h-[48vh] md:grid-cols-2 md:items-center md:gap-[13rem] md:pl-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-[calc(1.75rem-7px)] -mt-[7px] size-[15px] rotate-45 border border-accent bg-void transition-[background-color,box-shadow] duration-500 group-data-[lit]/path:bg-accent group-data-[lit]/path:shadow-[0_0_18px_var(--color-accent)] md:left-1/2 md:-ml-[7px]"
              />
              <div
                className={cx(
                  "max-w-md",
                  index % 2 === 0
                    ? "md:col-start-1 md:justify-self-end md:text-right"
                    : "md:col-start-2",
                )}
              >
                <p aria-hidden="true" className="path-year font-display">
                  {year}
                </p>
                <p className="mt-4 label text-ash-400">{entry.period}</p>
                <h3 className="mt-3 font-display text-title text-bone">{entry.role}</h3>
                <p className="mt-1 label text-accent">{entry.place}</p>
                <p className="mt-4 text-ash-200">{entry.summary}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
