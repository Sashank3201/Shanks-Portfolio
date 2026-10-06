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

export interface UiState extends PersistedPrefs {
  /** Realm target declared by the section currently in view (0 Shinigami → 1 Hollow). */
  sectionRealm: number;
  /** Mirrors `prefers-reduced-motion: reduce`, kept in sync by the motion policy. */
  systemReducedMotion: boolean;
  menuOpen: boolean;

  setRelease: (release: boolean) => void;
  toggleRelease: () => void;
  setSectionRealm: (realm: number) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setSystemReducedMotion: (reduced: boolean) => void;
  setMenuOpen: (open: boolean) => void;
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
      systemReducedMotion: false,
      menuOpen: false,

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
