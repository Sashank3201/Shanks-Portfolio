"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import "lenis/dist/lenis.css";

import { ScrollTrigger, gsap } from "@/lib/motion/gsap";
import { setLenis } from "@/lib/motion/scroll";
import { useReducedMotion } from "@/lib/motion/use-motion-gsap";
import { useUiStore } from "@/stores/ui-store";

/**
 * Smooth scrolling on the one shared clock: gsap.ticker → lenis.raf → ScrollTrigger.update.
 * Under reduced motion Lenis is not created at all and the page scrolls natively.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      stopInertiaOnNavigate: true,
    });
    setLenis(lenis);

    const unsubscribe = lenis.on("scroll", () => {
      ScrollTrigger.update();
    });
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);

    // Hold the page still while the preloader plays.
    const syncBootLock = (phase = useUiStore.getState().bootPhase) => {
      if (phase === "loading") lenis.stop();
      else lenis.start();
    };
    syncBootLock();
    const unsubscribeBoot = useUiStore.subscribe((state, previous) => {
      if (state.bootPhase !== previous.bootPhase) syncBootLock(state.bootPhase);
    });

    return () => {
      unsubscribeBoot();
      gsap.ticker.remove(tick);
      unsubscribe();
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
