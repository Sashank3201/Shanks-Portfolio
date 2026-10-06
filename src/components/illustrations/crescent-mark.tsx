import type { SVGProps } from "react";

/**
 * Logo mark: a crescent carved from the eclipse disc, inside a faint corona ring.
 * The crescent is a single path (outer arc of the disc, inner arc of the occluding moon),
 * so it renders without masks or IDs and can be morphed later.
 */
export function CrescentMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.35" />
      <path
        d="M16.36 4.01A12 12 0 1 0 27.46 19.55A10 10 0 1 1 16.36 4.01Z"
        fill="currentColor"
        data-part="crescent"
      />
    </svg>
  );
}
