import type { SVGProps } from "react";

/**
 * Horned mask — original line art. A shield-shaped face with swept horns, slanted eye slits,
 * tear-streak markings and a fanged grin. Every stroke carries `data-draw` so it can draw itself.
 * Colour comes from `currentColor` (eyes are filled); the face is filled with the void so the
 * horns root cleanly behind it.
 */
export function HornedMask(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g>
        <path data-draw className="fill-void" d="M64 70C38 66 16 44 12 6C24 30 44 46 72 52Z" />
        <path
          data-draw
          className="fill-void"
          d="M136 70C162 66 184 44 188 6C176 30 156 46 128 52Z"
        />
        <path
          data-draw
          className="fill-void"
          d="M100 38C128 38 152 52 158 82C164 112 156 150 138 178C126 196 112 210 100 218C88 210 74 196 62 178C44 150 36 112 42 82C48 52 72 38 100 38Z"
        />
        <path data-draw d="M58 92C72 86 88 88 98 98M142 92C128 86 112 88 102 98" />
        <path data-draw d="M100 52L106 70L100 88L94 70Z" />
        <path data-draw d="M112 104L142 96L136 112L114 114Z" fill="currentColor" />
        <path data-draw d="M88 104L58 96L64 112L86 114Z" fill="currentColor" />
        <path data-draw d="M126 120L131 162L128 170M74 120L69 162L72 170" />
        <path data-draw d="M64 166L75 180L84 171L92 186L100 174L108 186L116 171L125 180L136 166" />
        <path data-draw d="M74 194C90 204 110 204 126 194" />
      </g>
    </svg>
  );
}
