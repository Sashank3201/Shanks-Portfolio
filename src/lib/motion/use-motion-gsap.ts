"use client";

import type { RefObject } from "react";

import { isMotionReduced, selectReducedMotion, useUiStore } from "@/stores/ui-store";

import { useGSAP } from "./gsap";

export interface MotionContext {
  /** True when the OS or the in-site toggle asks for reduced motion. */
  reduced: boolean;
}

interface MotionGSAPOptions {
  scope?: RefObject<Element | null>;
  dependencies?: unknown[];
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
  { scope, dependencies = [] }: MotionGSAPOptions = {},
) {
  const reduced = useReducedMotion();

  return useGSAP(() => setup({ reduced: isMotionReduced() }), {
    scope,
    dependencies: [reduced, ...dependencies],
    revertOnUpdate: true,
  });
}
