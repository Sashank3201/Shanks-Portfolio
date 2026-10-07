/**
 * Mutable channel between the DOM/motion layer and the WebGL stage. Written by event handlers
 * and timelines, read every frame by the scene — never React state.
 */
export interface EclipseAnchor {
  /** Centre of the hero eclipse in document coordinates (CSS px). */
  docX: number;
  docY: number;
  /** Radius of the eclipse ring (CSS px). */
  radius: number;
}

export const sceneSignal = {
  /** Pointer in normalised device coordinates (-1…1, y up). */
  pointer: { x: 0, y: 0 },
  /** Hero eclipse anchor on the current page, or null when the page has none. */
  anchor: null as EclipseAnchor | null,
  /** Scrollable document height (CSS px). */
  docHeight: 0,
  /**
   * 0…1 visibility of the WebGL eclipse. Held at 0 while the preloader's ring flies onto it,
   * then faded in by the hero intro so there is never a double eclipse.
   */
  eclipseReveal: 1,
};
