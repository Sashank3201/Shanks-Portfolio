import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  PREFS_STORAGE_KEY,
  PREFS_VERSION,
  type MotionPreference,
  type PersistedPrefs,
} from "@/lib/realm/prefs";
import { clamp } from "@/lib/utils/math";

export type { MotionPreference };

/**
 * App boot sequence: `loading` while the preloader plays (first visit per session only),
 * `intro` while the hero choreography runs, then `ready`.
 */
export type BootPhase = "loading" | "intro" | "ready";

/** Page-transition state machine driven by TransitionLink and the route overlay. */
export type RoutePhase = "idle" | "covering" | "covered" | "revealing";

export interface UiState extends PersistedPrefs {
  /** Realm target declared by the section currently in view (0 Shinigami → 1 Hollow). */
  sectionRealm: number;
  /** Mirrors `prefers-reduced-motion: reduce`, kept in sync by the realm bridge. */
  systemReducedMotion: boolean;
  menuOpen: boolean;
  bootPhase: BootPhase;
  routePhase: RoutePhase;

  setRelease: (release: boolean) => void;
  toggleRelease: () => void;
  setSectionRealm: (realm: number) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setSystemReducedMotion: (reduced: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setBootPhase: (phase: BootPhase) => void;
  setRoutePhase: (phase: RoutePhase) => void;
}

/**
 * Read synchronously at store creation so the very first animation setup (which runs in a
 * layout effect, before any passive effect could sync it) already knows the OS preference.
 */
function systemPrefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The boot script marks first visits with `data-loading`; everyone else starts ready. */
function initialBootPhase(): BootPhase {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-loading")
    ? "loading"
    : "ready";
}

/**
 * Global UI store. A module singleton is intentional: it only ever holds client UI state (never
 * per-request data) and must be readable outside React — from GSAP callbacks and WebGL frames —
 * via `useUiStore.getState()`.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      release: false,
      motionPreference: "system",
      sectionRealm: 0,
      systemReducedMotion: systemPrefersReducedMotion(),
      menuOpen: false,
      bootPhase: initialBootPhase(),
      routePhase: "idle",

      setRelease: (release) => {
        set({ release });
      },
      toggleRelease: () => {
        set((state) => ({ release: !state.release }));
      },
      setSectionRealm: (realm) => {
        set({ sectionRealm: clamp(realm) });
      },
      setMotionPreference: (motionPreference) => {
        set({ motionPreference });
      },
      setSystemReducedMotion: (systemReducedMotion) => {
        set({ systemReducedMotion });
      },
      setMenuOpen: (menuOpen) => {
        set({ menuOpen });
      },
      setBootPhase: (bootPhase) => {
        set({ bootPhase });
      },
      setRoutePhase: (routePhase) => {
        set({ routePhase });
      },
    }),
    {
      name: PREFS_STORAGE_KEY,
      version: PREFS_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedPrefs => ({
        release: state.release,
        motionPreference: state.motionPreference,
      }),
    },
  ),
);

/** The realm the scene should ease toward. */
export const selectRealmTarget = (state: UiState): number =>
  state.release ? 1 : state.sectionRealm;

/** True when either the OS or the in-site toggle asks for reduced motion. */
export const selectReducedMotion = (state: UiState): boolean =>
  state.motionPreference === "reduce" || state.systemReducedMotion;

/** Imperative read for animation setup code that runs outside React's render. */
export function isMotionReduced(): boolean {
  return selectReducedMotion(useUiStore.getState());
}
