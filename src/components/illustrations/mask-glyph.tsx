import type { SVGProps } from "react";

/**
 * Small horned-mask glyph for the Release toggle. Original design: a shield-shaped face with two
 * swept horns; the eye slits and mouth stripes are cut out with the even-odd fill rule.
 */
export function MaskGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M7.2 6.6C5.1 5.6 3.6 3.6 3.2 1.4c1.7 1.2 3.6 2.2 5.5 3.1z" />
      <path d="M16.8 6.6c2.1-1 3.6-3 4-5.2-1.7 1.2-3.6 2.2-5.5 3.1z" />
      <path
        fillRule="evenodd"
        d="M12 4c4 0 6.5 3 6.5 7 0 4.5-2.5 8.5-6.5 10-4-1.5-6.5-5.5-6.5-10 0-4 2.5-7 6.5-7zm-4 6.5 3 1-.4 1.1-2.8-1zm8 0-3 1 .4 1.1 2.8-1zM10 15.6h.8v3h-.8zm1.6.4h.8v3.2h-.8zm1.6-.4h.8v3h-.8z"
      />
    </svg>
  );
}
