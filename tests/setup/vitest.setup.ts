import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no matchMedia; GSAP's ScrollTrigger needs one to register. Nothing matches.
function createMediaQueryList(media: string): MediaQueryList {
  return Object.assign(new EventTarget(), {
    matches: false,
    media,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
  });
}

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: createMediaQueryList,
});

afterEach(() => {
  cleanup();
});
