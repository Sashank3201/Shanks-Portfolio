import { beforeEach, describe, expect, it } from "vitest";

import { PREFS_STORAGE_KEY } from "@/lib/realm/prefs";

import { selectRealmTarget, selectReducedMotion, useUiStore } from "./ui-store";

describe("ui store", () => {
  beforeEach(() => {
    localStorage.clear();
    useUiStore.setState({
      release: false,
      motionPreference: "system",
      sectionRealm: 0,
      systemReducedMotion: false,
      menuOpen: false,
      staticMode: false,
    });
  });

  it("targets the section realm until Release is engaged", () => {
    useUiStore.getState().setSectionRealm(0.35);
    expect(selectRealmTarget(useUiStore.getState())).toBe(0.35);

    useUiStore.getState().toggleRelease();
    expect(selectRealmTarget(useUiStore.getState())).toBe(1);

    useUiStore.getState().toggleRelease();
    expect(selectRealmTarget(useUiStore.getState())).toBe(0.35);
  });

  it("clamps section realms to the unit range", () => {
    useUiStore.getState().setSectionRealm(4);
    expect(useUiStore.getState().sectionRealm).toBe(1);
  });

  it("reduces motion for either the OS setting or the in-site toggle", () => {
    expect(selectReducedMotion(useUiStore.getState())).toBe(false);
    useUiStore.getState().setSystemReducedMotion(true);
    expect(selectReducedMotion(useUiStore.getState())).toBe(true);
    useUiStore.getState().setSystemReducedMotion(false);
    useUiStore.getState().setMotionPreference("reduce");
    expect(selectReducedMotion(useUiStore.getState())).toBe(true);
  });

  it("persists only the visitor preferences", () => {
    useUiStore.getState().setRelease(true);
    useUiStore.getState().setMenuOpen(true);
    const stored = JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}") as {
      state: Record<string, unknown>;
    };
    expect(stored.state).toEqual({ release: true, motionPreference: "system" });
  });
});
