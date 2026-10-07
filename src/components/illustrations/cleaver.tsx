import type { SVGProps } from "react";

/**
 * The cleaver on its own — original line art for dividers and project cards: a cloth tail from
 * the pommel, wrapped grip, guard, and a broad blade with a cut tip, bevel and spine.
 */
export function Cleaver(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 160 520"
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
        <path data-draw d="M80 20C96 8 118 10 128 26C136 38 146 42 156 38" />
        <path data-draw d="M80 20C98 18 112 26 118 40C122 50 130 56 140 56" strokeOpacity={0.6} />
        <path data-draw className="fill-void" d="M72 22L88 22L89 110L71 110Z" />
        <path
          data-draw
          d="M71 36L89 32M71 52L89 48M71 68L89 64M71 84L89 80M71 100L89 96"
          strokeOpacity={0.6}
        />
        <path data-draw className="fill-void" d="M62 122L124 116L126 440L76 500L60 498Z" />
        <path data-draw className="fill-void" d="M56 112L130 106L131 118L57 124Z" />
        <path data-draw d="M112 130L114 434" strokeOpacity={0.6} />
        <path data-draw d="M68 134L67 488" strokeOpacity={0.3} />
      </g>
    </svg>
  );
}
