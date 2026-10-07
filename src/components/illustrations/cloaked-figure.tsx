import type { SVGProps } from "react";

import { chain, lineTo, strands, tatteredEdge } from "@/lib/art/line-art";

/** Points where reiatsu flames burn (neck, wrists, ankles), in viewBox units. */
export const FIGURE_FLAMES = [
  { x: 200, y: 140, r: 20 },
  { x: 140, y: 338, r: 14 },
  { x: 260, y: 338, r: 14 },
  { x: 191, y: 570, r: 11 },
  { x: 209, y: 570, r: 11 },
] as const;

/* The wind blows from the right: hair, coat tail, sash ends and bandages stream to the left. */

const HAIR = [
  ...strands(
    { x: 206, y: 64 },
    { x: 186, y: 104 },
    { count: 9, angle: 162, spread: 28, length: [60, 130], width: [9, 15], curl: 22, seed: 11 },
  ),
  ...strands(
    { x: 214, y: 92 },
    { x: 204, y: 124 },
    { count: 4, angle: 140, spread: 18, length: [50, 86], width: [7, 11], curl: 16, seed: 12 },
  ),
];

const HEM = { depth: [12, 40], width: [9, 20] } as const;
const COAT = [
  "M160 152C146 158 138 172 136 194C130 300 118 430 96 552",
  lineTo(tatteredEdge({ x: 96, y: 552 }, { x: 186, y: 560 }, { ...HEM, seed: 21 })),
  "L200 470L214 560",
  lineTo(tatteredEdge({ x: 214, y: 560 }, { x: 304, y: 552 }, { ...HEM, seed: 22 })),
  "C282 430 270 300 264 194C262 172 254 158 240 152Z",
].join("");

const TAIL = [
  "M124 440C108 474 82 502 42 520",
  lineTo(
    tatteredEdge(
      { x: 42, y: 520 },
      { x: 114, y: 562 },
      { depth: [8, 26], width: [8, 15], seed: 23 },
    ),
  ),
  "L120 500Z",
].join("");

const SASH_ENDS = strands(
  { x: 158, y: 312 },
  { x: 166, y: 316 },
  { count: 2, angle: 150, spread: 16, length: [64, 92], width: [8, 11], curl: -22, seed: 31 },
);

/** A chain from the pommel, wrapped once round the right wrist, its end hanging free. */
const CHAIN = chain(
  [
    { x: 248, y: 310 },
    { x: 239, y: 320 },
    { x: 236, y: 334 },
    { x: 246, y: 348 },
    { x: 266, y: 353 },
    { x: 278, y: 345 },
    { x: 283, y: 364 },
    { x: 286, y: 392 },
    { x: 282, y: 420 },
  ],
  8,
  4.2,
);

/**
 * The cloaked figure — original line art: wind-blown hair, ridged swept horns, a ragged fur collar,
 * a long coat split at the front with a torn hem and one tail caught by the wind, a sash with
 * trailing ends, bandaged hands, bare feet, and a giant cleaver held point-down with a chain
 * wrapped round the wrist. Outlines draw themselves (`data-draw`); the coat is a dark silhouette.
 * `data-flame-anchor` circles mark where the WebGL stage lights reiatsu flames (without WebGL
 * they glow softly in CSS).
 */
export function CloakedFigure(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 640"
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
        {/* Hair streaming behind the head. */}
        {HAIR.map((lock) => (
          <path key={lock} data-draw className="fill-void" d={lock} />
        ))}

        {/* Coat tail caught by the wind, behind the coat. */}
        <path data-draw className="fill-void" d={TAIL} />

        {/* Coat, split at the front, with a torn hem; folds and the lining at the split. */}
        <path data-draw className="fill-void" d={COAT} />
        <path data-draw d="M200 180V470" strokeOpacity={0.55} />
        <path
          data-draw
          d="M170 212C164 300 156 420 146 536M230 212C236 300 244 420 254 536"
          strokeOpacity={0.35}
        />
        <path
          data-draw
          d="M184 300C178 380 172 450 166 540M216 300C222 380 228 450 236 540M152 380C146 440 138 500 128 546"
          strokeOpacity={0.2}
        />
        <path data-draw d="M195 478L187 552M205 478L213 552" strokeOpacity={0.45} />

        {/* Sash at the waist, its ends trailing in the wind. */}
        {SASH_ENDS.map((end) => (
          <path key={end} data-draw className="fill-void" d={end} />
        ))}
        <path
          data-draw
          className="fill-void"
          d="M148 298C180 306 220 306 252 298L253 312C220 321 180 321 147 312Z"
        />
        <path data-draw d="M160 302L166 316M172 304L176 318" strokeOpacity={0.5} />

        {/* Bare feet, ankles bound. */}
        <path data-draw d="M186 566L196 566L198 596C192 600 182 600 176 596Z" />
        <path data-draw d="M204 566L214 566L224 596C218 600 208 600 202 596Z" />
        <path
          data-draw
          d="M185 573L197 571M185 579L197 577M203 571L215 573M203 577L216 579"
          strokeOpacity={0.6}
        />

        {/* Sleeves, ragged at the cuff, and the open, bandaged left hand. */}
        <path
          data-draw
          className="fill-void"
          d="M160 158C142 198 130 258 124 330L130 342L138 334L146 346L156 340C158 282 166 222 182 180Z"
        />
        <path
          data-draw
          className="fill-void"
          d="M240 158C258 198 270 258 276 330L270 342L262 334L254 346L244 340C242 282 234 222 218 180Z"
        />
        <path data-draw d="M132 344C130 358 134 368 142 372C150 366 152 354 150 344" />
        <path
          data-draw
          d="M133 350L149 346M133 357L150 352M135 364L149 359M134 352C121 356 110 366 98 361"
          strokeOpacity={0.6}
        />

        {/* Cleaver: wrapped grip, guard, broad blade with a cut tip, bevel and spine. */}
        <path data-draw className="fill-void" d="M241.6 311L254.3 308L267.7 365.6L255 368.6Z" />
        <path
          data-draw
          d="M243.8 320.6L257.2 320.5M246.6 332.6L260 332.5M249.4 344.6L262.8 344.5M252.2 356.6L265.6 356.5"
          strokeOpacity={0.6}
        />
        <path data-draw className="fill-void" d="M253.2 374L297.1 363.8L344.1 565.4L309.2 614Z" />
        <path data-draw className="fill-void" d="M249.2 369.9L298.9 358.3L300.7 366L251 377.6Z" />
        <path data-draw d="M290.5 375.5L334.2 562.7" strokeOpacity={0.6} />
        <path data-draw d="M259.9 385.1L310.3 601.1" strokeOpacity={0.3} />

        {/* Right fist closed around the grip, the chain wrapped round the wrist. */}
        <path
          data-draw
          className="fill-void"
          d="M246 338C244 350 247 362 257 365C267 362 270 350 268 338Z"
        />
        <path data-draw d="M249 347C254 349 262 349 267 347" strokeOpacity={0.6} />
        {CHAIN.map((link) => (
          <ellipse
            key={`${link.cx.toFixed(1)}-${link.cy.toFixed(1)}`}
            data-draw
            className="fill-void"
            cx={link.cx}
            cy={link.cy}
            rx={link.rx}
            ry={link.ry}
            transform={`rotate(${link.angle.toFixed(1)} ${link.cx.toFixed(1)} ${link.cy.toFixed(1)})`}
            strokeWidth={1.1}
          />
        ))}

        {/* Ragged fur collar. */}
        <path
          data-draw
          className="fill-void"
          d="M144 172C150 154 164 142 178 136L182 124L190 134L196 122L200 134L204 122L210 134L218 124L222 136C236 142 250 154 256 172C240 164 226 162 214 168L200 180L186 168C174 162 160 164 144 172Z"
        />
        <path
          data-draw
          d="M164 156L170 164M178 148L182 158M236 156L230 164M222 148L218 158"
          strokeOpacity={0.5}
        />

        {/* Head: ridged swept horns, burning eyes, the marks of a mask. */}
        <path
          data-draw
          className="fill-void"
          d="M186 78C160 80 144 64 146 40C150 58 168 66 190 64Z"
        />
        <path
          data-draw
          className="fill-void"
          d="M214 78C240 80 256 64 254 40C250 58 232 66 210 64Z"
        />
        <path
          data-draw
          d="M176 79Q172 72 177 66M163 76Q160 70 166 63M152 68Q150 63 156 58M224 79Q228 72 223 66M237 76Q240 70 234 63M248 68Q250 63 244 58"
          strokeOpacity={0.6}
        />
        <path
          data-draw
          className="fill-void"
          d="M180 96C180 76 188 62 200 62C212 62 220 76 220 96C220 110 212 122 200 128C188 122 180 110 180 96Z"
        />
        <path
          data-draw
          d="M190 99L188 114M210 99L212 114M192 113L196 117L200 113L204 117L208 113"
          strokeOpacity={0.55}
        />
        <path d="M187 92L196 94.5L195 97.5L188 96Z" fill="currentColor" stroke="none" />
        <path d="M213 92L204 94.5L205 97.5L212 96Z" fill="currentColor" stroke="none" />
      </g>

      {FIGURE_FLAMES.map(({ x, y, r }) => (
        <circle
          key={`${x}-${y}`}
          data-flame-anchor
          cx={x}
          cy={y}
          r={r}
          className="flame-anchor"
          stroke="none"
        />
      ))}
    </svg>
  );
}
