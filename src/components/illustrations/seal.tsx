import type { SVGProps } from "react";

interface SealProps extends SVGProps<SVGSVGElement> {
  /** One kanji (must exist in the Japanese accent subset). */
  glyph: string;
}

/** A circular seal stamped with one kanji — skill groups in the Arsenal. Decorative. */
export function Seal({ glyph, ...props }: SealProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g>
        <circle data-draw cx="50" cy="50" r="46" />
        <circle data-draw cx="50" cy="50" r="39" strokeDasharray="2 5" strokeOpacity={0.6} />
      </g>
      <text
        x="50"
        y="52"
        lang="ja"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="38"
        fill="currentColor"
        stroke="none"
        className="font-jp"
      >
        {glyph}
      </text>
    </svg>
  );
}
