"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { bootTasksSettled, delay, fontsReady, pageLoaded } from "@/lib/boot/ready";
import { EASE, gsap } from "@/lib/motion/gsap";
import { PRELOADED_SESSION_KEY } from "@/lib/realm/prefs";
import { useUiStore } from "@/stores/ui-store";

/** The preloader never holds the visitor longer than this, whatever is still loading. */
const MAX_WAIT_MS = 4500;

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
    const html = document.documentElement;
    const store = useUiStore.getState();
    if (!html.hasAttribute("data-loading")) {
      if (store.bootPhase === "loading") store.setBootPhase("ready");
      return;
    }

    const root = rootRef.current;
    const stage = stageRef.current;
    const ring = ringRef.current;
    const moon = moonRef.current;
    const corona = coronaRef.current;
    const counterEl = counterRef.current;
    const meta = metaRef.current;
    if (!root || !stage || !ring || !moon || !corona || !counterEl || !meta) return;

    const lifecycle = new AbortController();
    // A call (not a property read) so control-flow narrowing can't go stale across awaits.
    const cancelled = () => lifecycle.signal.aborted;
    const animations: gsap.core.Animation[] = [];
    const track = <T extends gsap.core.Animation>(animation: T): T => {
      animations.push(animation);
      return animation;
    };

    const counter = { value: 0 };
    const writeCounter = () => {
      counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
    };

    const finish = () => {
      html.removeAttribute("data-loading");
    };

    const run = async () => {
      // 1 — the ring draws and the counter climbs while the page gets ready.
      const drawing = track(
        gsap
          .timeline()
          .fromTo(
            ring,
            { drawSVG: "50% 50%" },
            { drawSVG: "0% 100%", duration: 1.5, ease: EASE.slash },
            0,
          )
          .to(
            counter,
            { value: 82, duration: 1.5, ease: "power2.inOut", onUpdate: writeCounter },
            0,
          ),
      );
      await Promise.race([
        Promise.all([fontsReady(), pageLoaded(), bootTasksSettled(), drawing]),
        delay(MAX_WAIT_MS),
      ]);
      if (cancelled()) return;

      // 2 — the eclipse forms.
      await track(
        gsap
          .timeline()
          .to(counter, { value: 100, duration: 0.5, ease: "power2.out", onUpdate: writeCounter }, 0)
          .to(moon, { attr: { cx: 109.8 }, duration: 0.95, ease: EASE.reiatsu }, 0)
          .fromTo(
            corona,
            { opacity: 0, scale: 0.55 },
            { opacity: 1, scale: 1, duration: 1.1, ease: EASE.reiatsu },
            0.15,
          ),
      );
      if (cancelled()) return;

      // 3 — hand off to the hero eclipse and lift the veil.
      sessionStorage.setItem(PRELOADED_SESSION_KEY, "1");
      const exit = track(gsap.timeline({ onComplete: finish }));
      const anchor = document.querySelector<HTMLElement>("[data-eclipse-anchor]");
      if (anchor) {
        const from = stage.getBoundingClientRect();
        const to = anchor.getBoundingClientRect();
        // The ring spans 70% of the stage's viewBox; the anchor's border box is the ring.
        const scale = to.width / (from.width * 0.7);
        exit.to(
          stage,
          {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale,
            duration: 1.15,
            ease: EASE.slash,
          },
          0,
        );
      }
      exit
        .to(meta, { opacity: 0, y: 16, duration: 0.4, ease: "power2.in" }, 0)
        .to(root, { "--veil": 0, duration: 0.9, ease: "power2.inOut" }, 0.25)
        .to(stage, { opacity: 0, duration: 0.45, ease: "power1.out" }, 0.95)
        // Let the hero choreography start while the veil is still lifting.
        .call(() => useUiStore.getState().setBootPhase("intro"), undefined, 0.55);
    };

    void run();

    return () => {
      lifecycle.abort();
      for (const animation of animations) animation.kill();
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
          <circle ref={moonRef} cx="290" cy="93" r="66.5" className="fill-void" />
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
