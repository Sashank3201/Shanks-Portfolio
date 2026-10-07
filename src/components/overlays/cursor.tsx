"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-motion-gsap";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = "a, button, [role='button'], summary, label, select, [data-cursor]";
const TEXT_ENTRY = "input, textarea, [contenteditable='true']";

function subscribeFinePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/**
 * Reiatsu cursor: an exact dot plus a lagging ring that grows over interactive elements and can
 * show a label (`data-cursor="view"` + `data-cursor-label="Open"`). Fine pointers only, and off
 * under reduced motion — the native cursor returns in both cases.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
  const enabled = finePointer && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!enabled || !root || !dot || !ring || !label) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");

    // quickSetter is typed as a bare Function upstream.
    const dotX = gsap.quickSetter(dot, "x", "px") as (value: number) => void;
    const dotY = gsap.quickSetter(dot, "y", "px") as (value: number) => void;
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    let visible = false;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      if (!visible) {
        visible = true;
        root.dataset.visible = "true";
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(TEXT_ENTRY)) {
        root.dataset.variant = "text";
        return;
      }
      const interactive = target?.closest<HTMLElement>(INTERACTIVE);
      root.dataset.variant = interactive ? (interactive.dataset.cursor ?? "link") : "default";
      label.textContent = interactive?.dataset.cursorLabel ?? "";
    };

    const onLeaveWindow = () => {
      visible = false;
      root.dataset.visible = "false";
    };

    const onDown = () => {
      root.dataset.pressed = "true";
    };
    const onUp = () => {
      root.dataset.pressed = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.dataset.visible = "false";
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-visible="false"
      data-variant="default"
      className="cursor pointer-events-none fixed inset-0 z-(--z-cursor)"
    >
      <div ref={ringRef} className="cursor-ring absolute top-0 left-0">
        <span ref={labelRef} className="cursor-label label" />
      </div>
      <div ref={dotRef} className="cursor-dot absolute top-0 left-0" />
    </div>
  );
}
