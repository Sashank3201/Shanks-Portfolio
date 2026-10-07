"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { EASE, ScrollTrigger, gsap } from "@/lib/motion/gsap";
import { registerRouteTransition } from "@/lib/motion/route-transition";
import { getLenis, scrollToTarget } from "@/lib/motion/scroll";
import { isMotionReduced, useUiStore } from "@/stores/ui-store";

/** Horizontal slant of the wipe edge, in % of the viewport width. */
const SLANT = 18;
const COVER_SECONDS = 0.85;
const REVEAL_SECONDS = 0.95;
const NAVIGATION_TIMEOUT_MS = 5000;

function coverClip(edge: number): string {
  return `polygon(0% 0%, ${edge + SLANT / 2}% 0%, ${edge - SLANT / 2}% 100%, 0% 100%)`;
}

/** Rotation that lines the blade up with the wipe edge for the current viewport. */
function bladeAngle(): number {
  return (Math.atan2((SLANT / 100) * window.innerWidth, window.innerHeight) * 180) / Math.PI;
}

function revealClip(edge: number): string {
  return `polygon(${edge + SLANT / 2}% 0%, 100% 0%, 100% 100%, ${edge - SLANT / 2}% 100%)`;
}

/**
 * Getsuga slash: a slanted wipe whose leading edge carries a crescent blade. It covers the
 * screen (with the destination's title card), waits for the route to change, then sweeps on to
 * reveal the new page. Back/forward navigations get the reveal half only.
 */
export function RouteTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bladeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const pathname = usePathname();
  const firstPathname = useRef(pathname);

  // Cover half, invoked by navigateWithTransition().
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const blade = bladeRef.current;
    const label = labelRef.current;
    if (!root || !panel || !blade || !label) return;

    registerRouteTransition({
      cover: (text) =>
        new Promise<void>((resolve) => {
          const edge = { value: -SLANT / 2 };
          label.textContent = text ?? "";
          root.dataset.active = "true";
          gsap
            .timeline({ onComplete: resolve })
            .set(blade, {
              xPercent: -50,
              rotate: bladeAngle(),
              left: `${edge.value}%`,
              opacity: 1,
            })
            .to(edge, {
              value: 100 + SLANT / 2,
              duration: COVER_SECONDS,
              ease: EASE.slash,
              onUpdate: () => {
                panel.style.clipPath = coverClip(edge.value);
                blade.style.left = `${edge.value}%`;
              },
            })
            .set(blade, { opacity: 0 })
            .fromTo(
              label,
              { opacity: 0, yPercent: 30 },
              { opacity: 1, yPercent: 0, duration: 0.35, ease: EASE.reiatsu },
              "-=0.2",
            );
        }),
    });

    return () => {
      registerRouteTransition(null);
    };
  }, []);

  // Reveal half, whenever the pathname changes.
  useEffect(() => {
    if (pathname === firstPathname.current) return;
    firstPathname.current = pathname;

    const root = rootRef.current;
    const panel = panelRef.current;
    const blade = bladeRef.current;
    const label = labelRef.current;
    if (!root || !panel || !blade || !label) return;

    const store = useUiStore.getState();
    const wasCovered = store.routePhase === "covered";
    if (!wasCovered && isMotionReduced()) return;

    // Land the new page at its target position while still hidden.
    getLenis()?.resize();
    if (window.location.hash) {
      scrollToTarget(window.location.hash, { immediate: true });
    } else {
      scrollToTarget(0, { immediate: true });
    }

    store.setRoutePhase("revealing");
    root.dataset.active = "true";
    const edge = { value: -SLANT / 2 };
    const duration = wasCovered ? REVEAL_SECONDS : REVEAL_SECONDS * 0.7;

    const timeline = gsap
      .timeline({
        onComplete: () => {
          root.dataset.active = "false";
          panel.style.clipPath = coverClip(-SLANT / 2);
          useUiStore.getState().setRoutePhase("idle");
          ScrollTrigger.refresh();
        },
      })
      .set(panel, { clipPath: revealClip(edge.value) })
      .to(label, { opacity: 0, duration: 0.25, ease: "power1.in" }, 0)
      .set(blade, { xPercent: -50, rotate: bladeAngle(), left: `${edge.value}%`, opacity: 1 }, 0.1)
      .to(
        edge,
        {
          value: 100 + SLANT / 2,
          duration,
          ease: EASE.slash,
          onUpdate: () => {
            panel.style.clipPath = revealClip(edge.value);
            blade.style.left = `${edge.value}%`;
          },
        },
        0.1,
      )
      .set(blade, { opacity: 0 });

    return () => {
      timeline.kill();
    };
  }, [pathname]);

  // Safety net: never leave the screen covered if a navigation fails or is cancelled.
  useEffect(() => {
    let timer = 0;
    const unsubscribe = useUiStore.subscribe((state, previous) => {
      if (state.routePhase === previous.routePhase) return;
      window.clearTimeout(timer);
      if (state.routePhase !== "covered") return;
      timer = window.setTimeout(() => {
        if (useUiStore.getState().routePhase !== "covered") return;
        if (rootRef.current) rootRef.current.dataset.active = "false";
        if (panelRef.current) panelRef.current.style.clipPath = coverClip(-SLANT / 2);
        if (labelRef.current) labelRef.current.style.opacity = "0";
        useUiStore.getState().setRoutePhase("idle");
      }, NAVIGATION_TIMEOUT_MS);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-active="false"
      className="route-transition pointer-events-none fixed inset-0 z-(--z-overlay)"
    >
      <div
        ref={panelRef}
        className="absolute inset-0 grid place-items-center bg-void"
        style={{ clipPath: coverClip(-SLANT / 2) }}
      >
        <p ref={labelRef} className="font-display text-display-lg text-bone opacity-0" />
      </div>
      <div
        ref={bladeRef}
        className="getsuga-blade absolute top-1/2 h-[140vh] w-[18vh] -translate-y-1/2 opacity-0"
      >
        <svg viewBox="0 0 40 300" preserveAspectRatio="none" className="size-full">
          <path d="M28 0C8 70 8 230 28 300C18 230 18 70 28 0Z" className="fill-rim" />
        </svg>
      </div>
    </div>
  );
}
