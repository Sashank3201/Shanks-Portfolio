import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PRELOADED_SESSION_KEY,
  PREFS_STORAGE_KEY,
  PREFS_VERSION,
  applyPrefsToRoot,
  bootInlineScript,
} from "./prefs";

function runBootScript() {
  // The script is a self-contained IIFE string shipped in <head>; evaluate it as the browser would.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- intentional: testing the shipped string
  const script = new Function(bootInlineScript) as () => void;
  script();
}

function store(state: unknown) {
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ state, version: PREFS_VERSION }));
}

function mockSystemMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduce && query.includes("reduce"), media: query })),
  );
}

describe("boot inline script", () => {
  const root = document.documentElement;

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    for (const attribute of ["data-release", "data-motion", "data-loading", "data-static"]) {
      root.removeAttribute(attribute);
    }
    root.style.removeProperty("--realm");
  });

  it("shows the preloader to first-time visitors", () => {
    mockSystemMotion(false);
    runBootScript();
    expect(root.hasAttribute("data-loading")).toBe(true);
    expect(root.hasAttribute("data-release")).toBe(false);
    expect(root.hasAttribute("data-motion")).toBe(false);
  });

  it("skips the preloader once it has played this session", () => {
    mockSystemMotion(false);
    sessionStorage.setItem(PRELOADED_SESSION_KEY, "1");
    runBootScript();
    expect(root.hasAttribute("data-loading")).toBe(false);
  });

  it("skips the preloader when the OS asks for reduced motion", () => {
    mockSystemMotion(true);
    runBootScript();
    expect(root.hasAttribute("data-loading")).toBe(false);
  });

  it("restores the Release realm before paint", () => {
    mockSystemMotion(false);
    store({ release: true, motionPreference: "system" });
    runBootScript();
    expect(root.getAttribute("data-release")).toBe("true");
    expect(root.style.getPropertyValue("--realm")).toBe("1");
  });

  it("restores the in-site reduce-motion preference and skips the preloader", () => {
    mockSystemMotion(false);
    store({ release: false, motionPreference: "reduce" });
    runBootScript();
    expect(root.getAttribute("data-motion")).toBe("reduce");
    expect(root.hasAttribute("data-loading")).toBe(false);
  });

  it("freezes the experience for visual tests with ?static=1", () => {
    mockSystemMotion(false);
    window.history.replaceState(null, "", "/?static=1");
    runBootScript();
    expect(root.hasAttribute("data-static")).toBe(true);
    expect(root.hasAttribute("data-loading")).toBe(false);
    window.history.replaceState(null, "", "/");
  });

  it("survives corrupt storage", () => {
    mockSystemMotion(false);
    localStorage.setItem(PREFS_STORAGE_KEY, "{not json");
    expect(runBootScript).not.toThrow();
  });

  it("matches the runtime applier", () => {
    applyPrefsToRoot(root, { release: true, motionPreference: "reduce" });
    expect(root.getAttribute("data-release")).toBe("true");
    expect(root.getAttribute("data-motion")).toBe("reduce");

    applyPrefsToRoot(root, { release: false, motionPreference: "system" });
    expect(root.hasAttribute("data-release")).toBe(false);
    expect(root.hasAttribute("data-motion")).toBe(false);
  });
});
