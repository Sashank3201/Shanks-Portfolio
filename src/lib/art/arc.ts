/** A point on a circle, angle in degrees clockwise from 12 o'clock (SVG coordinates, y down). */
export function polar(cx: number, cy: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

/** A clockwise arc from `start` to `end` degrees — e.g. a baseline for `<textPath>`. */
export function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const from = polar(cx, cy, radius, start);
  const to = polar(cx, cy, radius, end);
  const large = end - start > 180 ? 1 : 0;
  const r = radius.toFixed(2);
  return `M${from.x.toFixed(2)} ${from.y.toFixed(2)}A${r} ${r} 0 ${large} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}
