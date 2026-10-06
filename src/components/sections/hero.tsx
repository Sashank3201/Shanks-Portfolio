"use client";

import { useRef } from "react";

import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { profile } from "@/content/profile";
import { EASE, gsap, KATAKANA_GLYPHS, SplitText } from "@/lib/motion/gsap";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { useUiStore } from "@/stores/ui-store";

/**
 * The hero. Its copy is painted in the static HTML (it is the LCP element). When the preloader
 * is up, the copy is split and hidden underneath it, then choreographed in as the veil lifts.
 * Without a preloader (return visits, reduced motion) the hero is simply there.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = rootRef.current;
      if (!root || reduced || useUiStore.getState().bootPhase !== "loading") return;

      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const role = root.querySelector<HTMLElement>("[data-hero-role]");
      const tagline = root.querySelector<HTMLElement>("[data-hero-tagline]");
      const vertical = root.querySelector<HTMLElement>("[data-hero-vertical]");
      const eclipse = root.querySelector<HTMLElement>("[data-eclipse-anchor]");
      if (!title || !role || !tagline || !vertical || !eclipse) return;

      const titleSplit = SplitText.create(title, { type: "chars", mask: "chars" });
      const taglineSplit = SplitText.create(tagline, {
        type: "lines",
        mask: "lines",
        aria: "none",
      });
      const roleText = role.textContent;

      gsap.set(titleSplit.chars, { yPercent: 115 });
      gsap.set(taglineSplit.lines, { yPercent: 110 });
      gsap.set([role, vertical], { opacity: 0 });
      // Hidden while the preloader's ring flies onto it, then crossfaded in as it lands.
      gsap.set(eclipse, { opacity: 0 });

      const intro = gsap
        .timeline({
          paused: true,
          onComplete: () => {
            titleSplit.revert();
            taglineSplit.revert();
            useUiStore.getState().setBootPhase("ready");
          },
        })
        .to(titleSplit.chars, {
          yPercent: 0,
          duration: 1.4,
          ease: EASE.reiatsu,
          stagger: { each: 0.06, from: "start" },
        })
        .to(eclipse, { opacity: 1, duration: 0.7, ease: "power1.inOut" }, 0.3)
        .to(role, { opacity: 1, duration: 0.01 }, 0.15)
        .to(
          role,
          {
            duration: 1.1,
            ease: "none",
            scrambleText: { text: roleText, chars: KATAKANA_GLYPHS, revealDelay: 0.3 },
          },
          0.15,
        )
        .to(taglineSplit.lines, { yPercent: 0, duration: 1.1, ease: EASE.reiatsu }, 0.45)
        .fromTo(
          vertical,
          { opacity: 0, y: -24 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.reiatsu },
          0.6,
        );

      const unsubscribe = useUiStore.subscribe((state) => {
        if (state.bootPhase === "intro") intro.play();
      });

      return () => {
        unsubscribe();
      };
    },
    { scope: rootRef },
  );

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
