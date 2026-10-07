"use client";

import { useEffect, useRef } from "react";

import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { SpireSilhouette } from "@/components/illustrations/spire-silhouette";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { sceneSignal } from "@/lib/scene/scene-signal";
import { isMotionReduced, useUiStore } from "@/stores/ui-store";

import { HeroName } from "./hero-name";

/**
 * The hero. Its copy is painted in the static HTML (it is the LCP element). When the preloader
 * is up, the copy is split and hidden underneath it, then choreographed in as the veil lifts.
 *
 * Scrolling pins it for one viewport while the camera dives into the eclipse (`sceneSignal.dive`
 * drives the WebGL sky; the CSS eclipse scales with it when there is no WebGL), then the page
 * moves on and the eclipse re-emerges at rest (`sceneSignal.emerge`). Reduced motion: no pin.
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

  useMotionGSAP(
    ({ reduced }) => {
      const root = rootRef.current;
      if (!root || reduced) return;
      const select = gsap.utils.selector(root);

      // Transforms only on the CSS fallbacks: their opacity belongs to the WebGL hand-off.
      const dive = gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 0.5,
            // Sections below measure themselves after this pin's spacer exists.
            refreshPriority: 1,
          },
        })
        .to(sceneSignal, { dive: 1, duration: 1 }, 0)
        .to(select("[data-eclipse-anchor] > *"), { scale: 7, ease: "power2.in", duration: 1 }, 0)
        .to(select("[data-stage-fallback]"), { yPercent: 45, duration: 0.7 }, 0)
        .to(select("[data-hero-meta]"), { y: 24, autoAlpha: 0, duration: 0.25 }, 0)
        .to(select("[data-hero-vertical]"), { yPercent: -25, autoAlpha: 0, duration: 0.4 }, 0);

      const pinEnd = () => dive.scrollTrigger?.end ?? 0;
      gsap.to(sceneSignal, {
        emerge: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: pinEnd,
          end: () => pinEnd() + window.innerHeight * 0.8,
          scrub: 0.5,
        },
      });

      return () => {
        sceneSignal.dive = 0;
        sceneSignal.emerge = 0;
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      data-realm={0}
      className="relative isolate h-dvh min-h-[36rem] overflow-hidden"
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
        className="absolute top-[calc(var(--header-height)+2.5rem)] right-(--gutter) font-jp text-lg tracking-[0.5em] whitespace-nowrap text-ash-400 [writing-mode:vertical-rl] md:text-xl"
      >
        {profile.katakana}
      </p>

      <div className="absolute inset-x-0 bottom-0 container-site pb-6 md:pb-8">
        <HeroName name={profile.name} />
        <div
          data-hero-meta
          className="mt-4 grid grid-cols-2 items-end gap-6 border-t border-ash-800/70 pt-5 md:mt-6 md:grid-cols-3"
        >
          <p data-hero-role className="label text-ash-200">
            {profile.role}
          </p>
          <p data-hero-tagline className="hidden text-center text-ash-200 md:block">
            {profile.tagline}
          </p>
          <p className="flex items-center gap-3 justify-self-end label text-ash-400">
            Scroll to descend
            <span aria-hidden="true" className="relative h-7 w-px overflow-hidden bg-ash-800">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
