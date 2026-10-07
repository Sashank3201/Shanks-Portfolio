import { isMotionReduced, useUiStore } from "@/stores/ui-store";

/** Implemented by the route overlay; registered on mount. */
export interface RouteTransitionDriver {
  /** Sweeps the slash across until the screen is covered. */
  cover: (label?: string) => Promise<void>;
}

let driver: RouteTransitionDriver | null = null;

export function registerRouteTransition(next: RouteTransitionDriver | null): void {
  driver = next;
}

/**
 * Covers the screen, then navigates. The overlay reveals the new page when the pathname changes.
 * Falls back to plain navigation when the overlay is absent, motion is reduced, or a transition
 * is already running.
 */
export async function navigateWithTransition(navigate: () => void, label?: string): Promise<void> {
  const store = useUiStore.getState();
  if (!driver || isMotionReduced() || store.routePhase !== "idle") {
    navigate();
    return;
  }

  store.setRoutePhase("covering");
  await driver.cover(label);
  useUiStore.getState().setRoutePhase("covered");
  navigate();
}
