import type { SVGProps } from "react";

/** Points where reiatsu flames burn (neck, wrists, ankles), in viewBox units. */
export const FIGURE_FLAMES = [
  { x: 200, y: 140, r: 20 },
  { x: 140, y: 338, r: 14 },
  { x: 260, y: 338, r: 14 },
  { x: 191, y: 570, r: 11 },
  { x: 209, y: 570, r: 11 },
] as const;

/**
 * The cloaked figure — original line art: swept horns, a ragged fur collar, a long coat split at
 * the front with a torn hem and one tail caught by the wind, ragged sleeves, bare feet, and a
 * giant cleaver held point-down. Outlines draw themselves (`data-draw`); the coat is a dark
 * silhouette. `data-flame-anchor` circles mark where the WebGL stage lights reiatsu flames
 * (without WebGL they glow softly in CSS).
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
        {/* Coat tail caught by the wind, behind the coat. */}
        <path
          data-draw
          className="fill-void"
          d="M120 446C102 484 78 510 46 526L70 530L56 550L86 544L82 566L104 548L112 522Z"
        />

        {/* Coat, split at the front, with a torn hem. */}
        <path
          data-draw
          className="fill-void"
          d="M160 152C146 158 138 172 136 194C130 300 118 430 96 552L110 540L114 572L130 548L140 584L154 552L166 576L176 552L186 562L200 470L214 562L224 552L234 576L246 552L260 584L270 548L286 572L290 540L304 552C282 430 270 300 264 194C262 172 254 158 240 152Z"
        />
        <path data-draw d="M200 180V470" strokeOpacity={0.55} />
        <path
          data-draw
          d="M170 212C164 300 156 420 146 536M230 212C236 300 244 420 254 536"
          strokeOpacity={0.35}
        />

        {/* Bare feet below the split. */}
        <path data-draw d="M186 566L196 566L198 596C192 600 182 600 176 596Z" />
        <path data-draw d="M204 566L214 566L224 596C218 600 208 600 202 596Z" />

        {/* Sleeves, ragged at the cuff, and the open left hand. */}
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

        {/* Right fist closed around the grip. */}
        <path
          data-draw
          className="fill-void"
          d="M246 338C244 350 247 362 257 365C267 362 270 350 268 338Z"
        />
        <path data-draw d="M249 347C254 349 262 349 267 347" strokeOpacity={0.6} />

        {/* Ragged fur collar. */}
        <path
          data-draw
          className="fill-void"
          d="M144 172C150 154 164 142 178 136L182 124L190 134L196 122L200 134L204 122L210 134L218 124L222 136C236 142 250 154 256 172C240 164 226 162 214 168L200 180L186 168C174 162 160 164 144 172Z"
        />

        {/* Head: swept horns and burning eyes. */}
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
          className="fill-void"
          d="M180 96C180 76 188 62 200 62C212 62 220 76 220 96C220 110 212 122 200 128C188 122 180 110 180 96Z"
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
