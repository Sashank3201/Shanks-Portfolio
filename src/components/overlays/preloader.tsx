"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { useUiStore } from "@/stores/ui-store";

/**
 * "The eclipse forms" — first visit per session only (the boot script sets `data-loading`).
 * The ring draws while assets load, the moon slides in to carve the crescent, then the ring
 * flies onto the hero eclipse (`[data-eclipse-anchor]`) and the veil lifts.
 * Hidden by CSS unless `data-loading` is present, so it never flashes for anyone else.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const moonRef = useRef<SVGCircleElement>(null);
  const coronaRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const store = useUiStore.getState();
    if (!document.documentElement.hasAttribute("data-loading")) {
      if (store.bootPhase === "loading") store.setBootPhase("ready");
      return;
    }

    const root = rootRef.current;
    const stage = stageRef.current;
    const ring = ringRef.current;
    const moon = moonRef.current;
    const corona = coronaRef.current;
    const counter = counterRef.current;
    const meta = metaRef.current;
    if (!root || !stage || !ring || !moon || !corona || !counter || !meta) return;

    // The sequence (and DrawSVG) is only downloaded when the preloader actually plays.
    let cancelled = false;
    let dispose: (() => void) | undefined;
    void import("./preloader-sequence").then(({ playPreloader }) => {
      if (cancelled) return;
      dispose = playPreloader({ root, stage, ring, moon, corona, counter, meta });
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader fixed inset-0 z-(--z-preloader) place-items-center"
      style={{ "--veil": 1 } as CSSProperties}
    >
      <div className="absolute inset-0 bg-void opacity-(--veil)" />
      <div ref={stageRef} className="relative w-[min(60vw,22rem)] will-change-transform">
        <div
          ref={coronaRef}
          className="absolute -inset-[35%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-glow)_22%,transparent),transparent_72%)] opacity-0"
        />
        <svg viewBox="0 0 200 200" className="relative block w-full overflow-visible">
          <circle
            ref={ringRef}
            cx="100"
            cy="100"
            r="70"
            fill="none"
            strokeWidth="1.2"
            className="stroke-rim"
            transform="rotate(-90 100 100)"
          />
          <circle ref={moonRef} cx="290" cy="96.5" r="67.55" className="fill-void" />
        </svg>
      </div>
      <div
        ref={metaRef}
        className="absolute inset-x-0 bottom-0 flex items-end justify-between px-(--gutter) pb-8"
      >
        <p className="label text-ash-400">
          <span lang="ja" className="mr-3 font-jp text-accent">
            月蝕
          </span>
          The eclipse is forming
        </p>
        <span ref={counterRef} className="font-mono text-title text-bone tabular-nums">
          000
        </span>
      </div>
    </div>
  );
}
