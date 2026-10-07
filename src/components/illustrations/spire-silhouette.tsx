import { useId, type SVGProps } from "react";

import { SPIRE_HALF_WIDTH, spireSvgPath } from "@/lib/scene/spire-geometry";

const SPIRE_PATH = spireSvgPath();

interface SpireSilhouetteProps extends SVGProps<SVGSVGElement> {
  /** Dissolve the base into the dark, as the WebGL spire sinks into its mist. */
  fade?: boolean;
}

/**
 * The gothic spire as SVG, generated from the same geometry as the WebGL distance field — so the
 * no-WebGL hero shows the identical silhouette.
 */
export function SpireSilhouette({ fade = true, ...props }: SpireSilhouetteProps) {
  const id = useId();
  const maskId = `${id}-fade`;
  const gradientId = `${id}-fade-gradient`;

  return (
    <svg
      viewBox={`${-SPIRE_HALF_WIDTH} -1 ${SPIRE_HALF_WIDTH * 2} 1`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {fade && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="-1"
            x2="0"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.6" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity={0} />
          </linearGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-SPIRE_HALF_WIDTH}
            y={-1}
            width={SPIRE_HALF_WIDTH * 2}
            height={1}
          >
            <rect
              x={-SPIRE_HALF_WIDTH}
              y={-1}
              width={SPIRE_HALF_WIDTH * 2}
              height={1}
              fill={`url(#${gradientId})`}
            />
          </mask>
        </defs>
      )}
      <path d={SPIRE_PATH} fill="currentColor" mask={fade ? `url(#${maskId})` : undefined} />
    </svg>
  );
}
