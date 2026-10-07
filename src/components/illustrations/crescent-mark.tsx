import type { SVGProps } from "react";

import { CRESCENT_PATH } from "./logo-paths";

/**
 * Logo mark: a crescent carved from the eclipse disc, inside a faint corona ring.
 * The crescent is a single path (outer arc of the disc, inner arc of the occluding moon),
 * so it renders without masks or IDs and can be morphed (see `LogoMark`).
 */
export function CrescentMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.35" />
      <path d={CRESCENT_PATH} fill="currentColor" data-part="crescent" />
    </svg>
  );
}
