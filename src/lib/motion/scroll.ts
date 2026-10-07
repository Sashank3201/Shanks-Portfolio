import type Lenis from "lenis";

let lenis: Lenis | null = null;

/** Registered by SmoothScroll; null when smooth scrolling is off (reduced motion). */
export function setLenis(instance: Lenis | null): void {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

interface ScrollOptions {
  /** Skip the animation (used under reduced motion and for route changes). */
  immediate?: boolean;
  offset?: number;
}

/**
 * Scrolls to an element, selector or position through Lenis when it is running, falling back to
 * native scrolling so callers never need to know which mode is active.
 */
export function scrollToTarget(
  target: number | string | HTMLElement,
  { immediate = false, offset = 0 }: ScrollOptions = {},
): void {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, duration: 1.6 });
    return;
  }

  const behavior: ScrollBehavior = immediate ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (element instanceof HTMLElement) {
    const top = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior });
  }
}
