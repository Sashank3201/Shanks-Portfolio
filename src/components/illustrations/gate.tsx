import { useId, type SVGProps } from "react";

const LATTICE_COLUMNS = [23, 46, 69, 92];
const LATTICE_ROWS = [150, 195, 240, 285];

/** The sacred rope's sag between the posts. */
const ROPE = { from: 84, to: 316, top: 104, sag: 20 };
const ropeY = (x: number) =>
  ROPE.top + ROPE.sag * Math.sin((Math.PI * (x - ROPE.from)) / (ROPE.to - ROPE.from));

/** Two strands twisting round each other along the sag. */
function ropeStrand(phase: number): string {
  const points: string[] = [];
  for (let x = ROPE.from; x <= ROPE.to; x += 4) {
    const twist = 3 * Math.sin(((x - ROPE.from) / 9) * Math.PI + phase);
    points.push(`${x.toFixed(1)} ${(ropeY(x) + twist).toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}
const ROPE_STRANDS = [ropeStrand(0), ropeStrand(Math.PI)];

/** Zigzag paper streamers hanging from the rope. */
const SHIDE = [128, 174, 226, 272].map((x) => {
  const y = ropeY(x) + 2;
  return `M${x} ${y.toFixed(1)}L${x + 7} ${(y + 8).toFixed(1)}L${x - 1} ${(y + 11).toFixed(1)}L${x + 7} ${(y + 19).toFixed(1)}L${x - 1} ${(y + 22).toFixed(1)}L${x + 7} ${(y + 30).toFixed(1)}`;
});

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
 * The gate — original line art of a shrine gate: an upswept top beam, a plaque bearing 門,
 * latticed doors, and a twisted sacred rope hung with zigzag paper streamers. Doors are grouped
 * under `data-door="left|right"` so the contact choreography can part them over the light
 * behind.
 */
export function Gate(props: SVGProps<SVGSVGElement>) {
  const lightId = `${useId()}-light`;

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
        <defs>
          <radialGradient id={lightId} cx="50%" cy="80%" r="70%">
            <stop offset="0" stopColor="currentColor" stopOpacity={0.9} />
            <stop offset="1" stopColor="currentColor" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect
          data-gate-light
          x={84}
          y={108}
          width={232}
          height={212}
          fill={`url(#${lightId})`}
          stroke="none"
          opacity={0}
        />
        <path data-draw d="M6 36C60 50 340 50 394 36L388 56C330 64 70 64 12 56Z" />
        <path data-draw d="M14 61C72 69 328 69 386 61" strokeOpacity={0.6} />
        <path data-draw d="M6 36C1 31 2 24 9 21M394 36C399 31 398 24 391 21" />
        <path data-draw d="M44 82L356 82L352 96L48 96Z" />
        <path data-draw d="M66 56L82 56L84 320L64 320Z" />
        <path data-draw d="M318 56L334 56L336 320L316 320Z" />
        <path data-draw d="M64 300H84M316 300H336" strokeOpacity={0.5} />
        <Door side="left" />
        <Door side="right" />
        <rect data-draw x={185} y={60} width={30} height={22} className="fill-void" />
        <text
          x={200}
          y={71.5}
          lang="ja"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fill="currentColor"
          stroke="none"
          className="font-jp"
        >
          門
        </text>
        {ROPE_STRANDS.map((strand) => (
          <path key={strand} data-draw d={strand} strokeWidth={1.8} />
        ))}
        {SHIDE.map((streamer) => (
          <path key={streamer} data-draw d={streamer} strokeWidth={1.1} strokeOpacity={0.85} />
        ))}
      </g>
    </svg>
  );
}
