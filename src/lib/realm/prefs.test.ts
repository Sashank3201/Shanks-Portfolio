import { afterEach, describe, expect, it } from "vitest";

import { PREFS_STORAGE_KEY, PREFS_VERSION, applyPrefsToRoot, prefsInlineScript } from "./prefs";

function runInlineScript() {
  // The script is a self-contained IIFE string shipped in <head>; evaluate it as the browser would.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- intentional: testing the shipped string
  const script = new Function(prefsInlineScript) as () => void;
  script();
}

function store(state: unknown) {
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ state, version: PREFS_VERSION }));
}

describe("prefs inline script", () => {
  const root = document.documentElement;

  afterEach(() => {
    localStorage.clear();
    root.removeAttribute("data-release");
    root.removeAttribute("data-motion");
    root.style.removeProperty("--realm");
  });

  it("does nothing for first-time visitors", () => {
    runInlineScript();
    expect(root.hasAttribute("data-release")).toBe(false);
    expect(root.hasAttribute("data-motion")).toBe(false);
  });

  it("restores the Release realm before paint", () => {
    store({ release: true, motionPreference: "system" });
    runInlineScript();
    expect(root.getAttribute("data-release")).toBe("true");
    expect(root.style.getPropertyValue("--realm")).toBe("1");
    expect(root.hasAttribute("data-motion")).toBe(false);
  });

  it("restores the reduce-motion preference", () => {
    store({ release: false, motionPreference: "reduce" });
    runInlineScript();
    expect(root.getAttribute("data-motion")).toBe("reduce");
    expect(root.hasAttribute("data-release")).toBe(false);
  });

  it("survives corrupt storage", () => {
    localStorage.setItem(PREFS_STORAGE_KEY, "{not json");
    expect(runInlineScript).not.toThrow();
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
