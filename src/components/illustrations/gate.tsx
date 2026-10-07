import type { SVGProps } from "react";

const LATTICE_COLUMNS = [23, 46, 69, 92];
const LATTICE_ROWS = [150, 195, 240, 285];

function Door({ side }: { side: "left" | "right" }) {
  const x = side === "left" ? 84 : 200;
  return (
    <g data-door={side}>
      <rect data-draw x={x} y={108} width={116} height={212} className="fill-void" />
      {LATTICE_COLUMNS.map((offset) => (
        <path key={offset} data-draw d={`M${x + offset} 108V320`} strokeOpacity={0.5} />
      ))}
      {LATTICE_ROWS.map((y) => (
        <path key={y} data-draw d={`M${x} ${y}H${x + 116}`} strokeOpacity={0.5} />
      ))}
    </g>
  );
}

/**
 * The gate — original line art of a shrine gate with latticed doors. Doors are grouped under
 * `data-door="left|right"` so the contact choreography can part them over the light behind.
 */
export function Gate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 320"
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
        <rect data-gate-light x={84} y={108} width={232} height={212} className="fill-rim/0" />
        <path data-draw d="M6 36C60 50 340 50 394 36L388 56C330 64 70 64 12 56Z" />
        <path data-draw d="M44 82L356 82L352 96L48 96Z" />
        <path data-draw d="M66 56L82 56L84 320L64 320Z" />
        <path data-draw d="M318 56L334 56L336 320L316 320Z" />
        <path data-draw d="M196 62V82" />
        <Door side="left" />
        <Door side="right" />
      </g>
    </svg>
  );
}
