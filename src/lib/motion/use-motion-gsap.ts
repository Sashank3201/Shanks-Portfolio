"use client";

import type { RefObject } from "react";

import { isMotionReduced, selectReducedMotion, useUiStore } from "@/stores/ui-store";

import { useGSAP } from "./gsap";

/** Wraps a callback that runs later so the animations it creates still belong to the context. */
export type ContextSafe = <T extends (...args: never[]) => unknown>(callback: T) => T;

export interface MotionContext {
  /** True when the OS or the in-site toggle asks for reduced motion. */
  reduced: boolean;
  /**
   * For work that happens after the setup returns (a lazily loaded plugin, an event handler):
   * animations created inside the wrapped callback are reverted with everything else. Async work
   * must still check that the setup is current, because a reverted context accepts new tweens.
   */
  contextSafe: ContextSafe;
}

interface MotionGSAPOptions {
  scope?: RefObject<Element | null>;
  dependencies?: unknown[];
  /**
   * Revert everything when a dependency changes (default). Turn off when a new run should pick
   * up from the current animated state instead — e.g. a morph reversed halfway.
   */
  revertOnUpdate?: boolean;
}

/** Subscribes to the effective reduced-motion preference. */
export function useReducedMotion(): boolean {
  return useUiStore(selectReducedMotion);
}

/**
 * `useGSAP` with the house rule baked in: every animation receives `{ reduced }` and must provide
 * a calm branch. When the preference changes, everything created in the callback is reverted and
 * the setup re-runs with the new branch.
 *
 * The preference is read imperatively for the first run (the store is initialised from the OS
 * setting and persisted toggle synchronously), and subscribed to for later changes.
 */
export function useMotionGSAP(
  /** May return a cleanup function, like useGSAP. */
  setup: (context: MotionContext) => unknown,
  { scope, dependencies = [], revertOnUpdate = true }: MotionGSAPOptions = {},
) {
  const reduced = useReducedMotion();

  return useGSAP(
    (_context, contextSafe) => {
      // gsap.Context#add always passes it; the published typings just mark it optional.
      if (!contextSafe) throw new Error("useMotionGSAP: GSAP did not provide contextSafe");
      return setup({ reduced: isMotionReduced(), contextSafe });
    },
    { scope, dependencies: [reduced, ...dependencies], revertOnUpdate },
  );
}
