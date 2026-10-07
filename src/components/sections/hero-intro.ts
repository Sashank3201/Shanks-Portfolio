import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import { EASE, gsap, KATAKANA_GLYPHS, SplitText } from "@/lib/motion/gsap";
import { sceneSignal } from "@/lib/scene/scene-signal";
import { useUiStore } from "@/stores/ui-store";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * The hero's entrance, choreographed with the preloader's exit. Loaded on demand: only first
 * visits of a session (when the preloader plays) download it.
 *
 * Splits and hides the copy while the veil still covers it, then plays when the boot phase
 * reaches `intro`. Returns a disposer that reverts everything it touched.
 */
export function prepareHeroIntro(root: HTMLElement): () => void {
  const title = root.querySelector<HTMLElement>("[data-hero-title]");
  const role = root.querySelector<HTMLElement>("[data-hero-role]");
  const tagline = root.querySelector<HTMLElement>("[data-hero-tagline]");
  const vertical = root.querySelector<HTMLElement>("[data-hero-vertical]");
  const eclipse = root.querySelector<HTMLElement>("[data-eclipse-anchor]");
  if (!title || !role || !tagline || !vertical || !eclipse) return () => undefined;

  let unsubscribe: (() => void) | undefined;

  const context = gsap.context(() => {
    const titleSplit = SplitText.create(title, { type: "chars", mask: "chars" });
    const taglineSplit = SplitText.create(tagline, { type: "lines", mask: "lines", aria: "none" });
    const roleText = role.textContent;

    gsap.set(titleSplit.chars, { yPercent: 115 });
    gsap.set(taglineSplit.lines, { yPercent: 110 });
    gsap.set([role, vertical], { opacity: 0 });
    // Hidden while the preloader's ring flies onto it, then crossfaded in as it lands —
    // both the CSS eclipse and the WebGL one.
    gsap.set(eclipse, { opacity: 0 });
    sceneSignal.eclipseReveal = 0;

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
      .to(sceneSignal, { eclipseReveal: 1, duration: 0.9, ease: "power1.inOut" }, 0.3)
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

    // The preloader may already have handed over while this module was downloading.
    if (useUiStore.getState().bootPhase !== "loading") {
      intro.play();
      return;
    }
    unsubscribe = useUiStore.subscribe((state) => {
      if (state.bootPhase === "intro") intro.play();
    });
  }, root);

  return () => {
    unsubscribe?.();
    context.revert();
    sceneSignal.eclipseReveal = 1;
  };
}
