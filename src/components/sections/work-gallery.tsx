"use client";

import { useRef, type ReactNode } from "react";

import { gsap } from "@/lib/motion/gsap";
import { scrollToTarget } from "@/lib/motion/scroll";
import { useMotionGSAP } from "@/lib/motion/use-motion-gsap";
import { createPlane, registerPlane, type TrackedPlane } from "@/lib/scene/plane-registry";
import { clamp } from "@/lib/utils/math";

/** Pointer position over an element, in UV space (0…1, y up). */
function toUv(element: HTMLElement, event: PointerEvent) {
  const rect = element.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp(1 - (event.clientY - rect.top) / rect.height),
  };
}

/**
 * Behaviour for the Work gallery the server renders (`[data-rail]` > `[data-track]` >
 * `[data-panel]` with a `[data-plane]` cover):
 * - every cover becomes a WebGL plane (motif and seed from data attributes) whose hover burns
 *   through from where the pointer entered;
 * - on wide screens the gallery pins and its track slides sideways with the scroll, with a
 *   counter, and keyboard focus scrolls the focused panel into view.
 * Reduced motion keeps the grid and swaps hover states instantly.
 */
export function WorkGallery({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useMotionGSAP(
    ({ reduced }) => {
      const root = rootRef.current;
      if (!root) return;

      const cleanups: (() => void)[] = [];
      for (const cover of root.querySelectorAll<HTMLElement>("[data-plane]")) {
        const plane = createPlane(
          cover,
          Number(cover.dataset.motif ?? 0),
          Number(cover.dataset.seed ?? 0),
        );
        cleanups.push(registerPlane(plane), bindHover(plane, cover, reduced));
      }

      const mm = gsap.matchMedia();
      if (!reduced) {
        mm.add("(min-width: 1024px)", () => {
          const rail = root.querySelector<HTMLElement>("[data-rail]");
          const track = root.querySelector<HTMLElement>("[data-track]");
          const counter = root.querySelector<HTMLElement>("[data-counter]");
          if (!rail || !track) return;
          const panels = Array.from(track.querySelectorAll<HTMLElement>("[data-panel]"));

          root.dataset.layout = "rail";
          const distance = () => Math.max(track.scrollWidth - rail.clientWidth, 0);
          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: rail,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              onUpdate: ({ progress }) => {
                if (!counter) return;
                const index = Math.round(progress * (panels.length - 1)) + 1;
                counter.textContent = `${String(index).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
              },
            },
          });

          // Keyboard: focusing a panel's link scrolls the rail to centre that panel.
          const onFocus = (event: FocusEvent) => {
            const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-panel]");
            const trigger = slide.scrollTrigger;
            if (!panel || !trigger) return;
            const offset = panel.offsetLeft - (rail.clientWidth - panel.offsetWidth) / 2;
            const progress = clamp(offset / Math.max(distance(), 1));
            scrollToTarget(trigger.start + progress * (trigger.end - trigger.start));
          };
          root.addEventListener("focusin", onFocus);

          return () => {
            root.removeEventListener("focusin", onFocus);
            delete root.dataset.layout;
          };
        });
      }

      return () => {
        for (const cleanup of cleanups) cleanup();
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

/** Hover (and keyboard focus) burns the cover through from where the pointer came in. */
function bindHover(plane: TrackedPlane, cover: HTMLElement, reduced: boolean): () => void {
  const panel = cover.closest<HTMLElement>("[data-panel]") ?? cover;
  const ignite = (origin: { x: number; y: number }) => {
    if (plane.hover < 0.05) plane.origin = origin;
    gsap.to(plane, { hover: 1, duration: reduced ? 0 : 1.2, ease: "power2.out", overwrite: true });
  };
  const douse = () => {
    gsap.to(plane, {
      hover: 0,
      duration: reduced ? 0 : 0.9,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  const onEnter = (event: PointerEvent) => {
    ignite(toUv(cover, event));
  };
  const onMove = (event: PointerEvent) => {
    plane.pointer = toUv(cover, event);
  };
  const onFocusIn = () => {
    ignite({ x: 0.5, y: 0.5 });
  };
  const onFocusOut = (event: FocusEvent) => {
    if (!panel.contains(event.relatedTarget as Node | null)) douse();
  };

  panel.addEventListener("pointerenter", onEnter);
  panel.addEventListener("pointermove", onMove);
  panel.addEventListener("pointerleave", douse);
  panel.addEventListener("focusin", onFocusIn);
  panel.addEventListener("focusout", onFocusOut);
  return () => {
    gsap.killTweensOf(plane);
    panel.removeEventListener("pointerenter", onEnter);
    panel.removeEventListener("pointermove", onMove);
    panel.removeEventListener("pointerleave", douse);
    panel.removeEventListener("focusin", onFocusIn);
    panel.removeEventListener("focusout", onFocusOut);
  };
}
