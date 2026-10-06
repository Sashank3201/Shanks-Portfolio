/**
 * The animated realm value (0 Shinigami → 1 Hollow).
 *
 * A plain mutable object rather than React state: it changes every frame during transitions and
 * is read directly by WebGL `useFrame` loops and GSAP callbacks. The realm bridge is the only
 * writer; it also mirrors the value into the `--realm` CSS custom property.
 */
export const realmSignal = { current: 0 };
