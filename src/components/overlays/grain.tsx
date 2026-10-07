/** Fractal-noise tile, rasterised once by the browser and then only translated. */
const NOISE_TILE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/** Film grain over everything. Static under reduced motion. */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -inset-1/2 z-(--z-grain) animate-grain opacity-[0.06] mix-blend-overlay will-change-transform calm:animate-none"
      style={{ backgroundImage: `url("${NOISE_TILE}")` }}
    />
  );
}
