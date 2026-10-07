import type { SVGProps } from "react";

import { crack } from "@/lib/art/line-art";

const CRACKS = [
  crack(
    { x: 124, y: 47 },
    { length: 36, angle: 100, step: [5, 9], jitter: 34, branching: 0.35, seed: 41 },
  ),
  crack(
    { x: 50, y: 128 },
    { length: 30, angle: 42, step: [5, 8], jitter: 30, branching: 0.3, seed: 42 },
  ),
  crack(
    { x: 148, y: 140 },
    { length: 22, angle: 128, step: [4, 7], jitter: 28, branching: 0.25, seed: 43 },
  ),
];

/** Upper fangs hang from the grin (x, length); the canines are longest. */
const UPPER_FANGS = [
  [76, 16],
  [88, 10],
  [100, 9],
  [112, 10],
  [124, 16],
] as const;

/** The grin's height at x (the curve M62 168 C82 182 118 182 138 168, approximated). */
const grinY = (x: number) => 168 + 10.5 * (1 - ((x - 100) / 38) ** 2);

/**
 * Horned mask — original line art. A shield-shaped face with ridged, swept horns, double brow
 * plates, slanted eye slits, tapered stripes, cracks, and a fanged grin. Every stroke carries
 * `data-draw` so it can draw itself; colour comes from `currentColor`. The face is filled with
 * the void so the horns root cleanly behind it.
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
          d="M49 65Q50 56 56 47M32 54Q34 45 39 38M20 36Q21 30 25 25M151 65Q150 56 144 47M168 54Q166 45 161 38M180 36Q179 30 175 25"
          strokeOpacity={0.65}
        />
        <path
          data-draw
          className="fill-void"
          d="M100 38C128 38 152 52 158 82C164 112 156 150 138 178C126 196 112 210 100 218C88 210 74 196 62 178C44 150 36 112 42 82C48 52 72 38 100 38Z"
        />

        {/* Brow plates, forehead mark and cracks. */}
        <path data-draw d="M58 92C72 86 88 88 98 98M142 92C128 86 112 88 102 98" />
        <path
          data-draw
          d="M56 84C70 76 88 78 99 89M144 84C130 76 112 78 101 89"
          strokeOpacity={0.55}
        />
        <path data-draw d="M100 52L106 70L100 88L94 70Z" />
        {CRACKS.map((path) => (
          <path key={path} data-draw d={path} strokeOpacity={0.7} strokeWidth={1.1} />
        ))}

        {/* Eye slits and the tapered stripes beneath them. */}
        <path data-draw d="M112 104L142 96L136 112L114 114Z" fill="currentColor" />
        <path data-draw d="M88 104L58 96L64 112L86 114Z" fill="currentColor" />
        <path
          data-draw
          d="M128 119L136 120L133 160L130 172L127 160Z"
          fill="currentColor"
          fillOpacity={0.85}
        />
        <path
          data-draw
          d="M72 119L64 120L67 160L70 172L73 160Z"
          fill="currentColor"
          fillOpacity={0.85}
        />

        {/* The grin: upper fangs hanging from it, two lower fangs rising. */}
        <path data-draw d="M62 168C82 182 118 182 138 168" />
        {UPPER_FANGS.map(([x, length]) => {
          const y = grinY(x);
          return (
            <path
              key={x}
              data-draw
              className="fill-void"
              d={`M${x - 4.5} ${(y - 0.5).toFixed(1)}L${x} ${(y + length).toFixed(1)}L${x + 4.5} ${(y - 0.5).toFixed(1)}`}
            />
          );
        })}
        <path data-draw d="M72 194C90 204 110 204 128 194" />
        <path data-draw className="fill-void" d="M85 199L90 187L95 200M105 200L110 187L115 199" />
      </g>
    </svg>
  );
}
