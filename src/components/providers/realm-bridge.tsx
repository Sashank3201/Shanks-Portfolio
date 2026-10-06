"use client";

import { gsap } from "gsap";
import { useEffect } from "react";

import { applyPrefsToRoot } from "@/lib/realm/prefs";
import { realmSignal } from "@/lib/realm/realm-signal";
import { selectRealmTarget, selectReducedMotion, useUiStore } from "@/stores/ui-store";

const REALM_EASE_SECONDS = 1.4;
const REALM_CALM_SECONDS = 0.25;

/**
 * Bridges the UI store to the document:
 * - keeps `systemReducedMotion` in sync with the OS media query,
 * - mirrors persisted preferences onto <html> (data-release / data-motion),
 * - eases the realm toward its target with one GSAP tween that writes `--realm`.
 */
export function RealmBridge() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncSystemMotion = () => {
      useUiStore.getState().setSystemReducedMotion(media.matches);
    };
    const writeRealm = () => {
      root.style.setProperty("--realm", realmSignal.current.toFixed(4));
    };

    syncSystemMotion();
    media.addEventListener("change", syncSystemMotion);

    // The inline <head> script already painted the persisted realm; start from the same value.
    const initial = useUiStore.getState();
    applyPrefsToRoot(root, initial);
    realmSignal.current = selectRealmTarget(initial);
    writeRealm();

    const unsubscribe = useUiStore.subscribe((next, prev) => {
      if (next.release !== prev.release || next.motionPreference !== prev.motionPreference) {
        applyPrefsToRoot(root, next);
      }

      const target = selectRealmTarget(next);
      if (target === selectRealmTarget(prev)) return;

      gsap.to(realmSignal, {
        current: target,
        duration: selectReducedMotion(next) ? REALM_CALM_SECONDS : REALM_EASE_SECONDS,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: writeRealm,
      });
    });

    return () => {
      unsubscribe();
      media.removeEventListener("change", syncSystemMotion);
      gsap.killTweensOf(realmSignal);
    };
  }, []);

  return null;
}
