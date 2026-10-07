"use client";

import { useEffect, useRef } from "react";

import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { SpireSilhouette } from "@/components/illustrations/spire-silhouette";
import { profile } from "@/content/profile";
import { isMotionReduced, useUiStore } from "@/stores/ui-store";

/**
 * The hero. Its copy is painted in the static HTML (it is the LCP element). When the preloader
 * is up, the copy is split and hidden underneath it, then choreographed in as the veil lifts.
 * Without a preloader (return visits, reduced motion) the hero is simply there.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isMotionReduced() || useUiStore.getState().bootPhase !== "loading") return;

    // The entrance choreography is only downloaded when the preloader plays.
    let cancelled = false;
    let dispose: (() => void) | undefined;
    void import("./hero-intro").then(({ prepareHeroIntro }) => {
      if (cancelled) return;
      dispose = prepareHeroIntro(root);
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      data-realm={0}
      className="relative isolate flex min-h-dvh flex-col justify-end overflow-hidden pb-[12vh]"
    >
      <div
        data-eclipse-anchor
        className="absolute top-[34%] left-1/2 -z-10 w-[min(64vw,30rem)] -translate-x-1/2 -translate-y-1/2"
      >
        <EclipseFallback className="w-full" />
      </div>

      {/* The WebGL composition in CSS: the spire's tip just below the ring (34% + 1.08 radii), its
          base sinking into the bottom edge, a faint beam rising into the eclipse. */}
      <div
        data-stage-fallback
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -z-20 flex h-[calc(66%_-_min(64vw,30rem)_*_0.54)] -translate-x-1/2 flex-col items-center"
      >
        <div className="h-[calc(min(64vw,30rem)_*_0.42)] w-px shrink-0 -translate-y-full bg-linear-to-t from-accent/45 to-transparent" />
        <SpireSilhouette className="spire-fallback -mt-[calc(min(64vw,30rem)_*_0.42)] h-full w-auto" />
      </div>

      <p
        lang="ja"
        aria-hidden="true"
        data-hero-vertical
        className="absolute top-[calc(var(--header-height)+3rem)] right-(--gutter) font-jp text-lg tracking-[0.5em] whitespace-nowrap text-ash-400 [writing-mode:vertical-rl] md:top-auto md:bottom-[14vh] md:text-xl"
      >
        {profile.katakana}
      </p>

      <div className="relative container-site">
        <p data-hero-role className="mb-6 label text-ash-200">
          {profile.role}
        </p>
        <h1
          id="hero-title"
          data-hero-title
          className="font-display text-display-2xl font-medium glow"
        >
          {profile.name}
        </h1>
        <p data-hero-tagline className="mt-8 max-w-md text-lead text-ash-200">
          {profile.tagline}
        </p>
      </div>
    </section>
  );
}
