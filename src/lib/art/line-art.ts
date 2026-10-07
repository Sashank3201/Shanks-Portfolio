import type { Point } from "./bolt";
import { seededRandom } from "./random";

/**
 * Seeded generators for the line-art illustrations: the irregular detail (torn hems, hair, chain,
 * cracks) that would be thousands of hand-placed points. Same seed → same drawing, so server and
 * client render identical SVG.
 */

const fmt = (value: number) => value.toFixed(1);
const point = (p: Point) => `${fmt(p.x)} ${fmt(p.y)}`;
const range = (random: () => number, [min, max]: readonly [number, number]) =>
  min + random() * (max - min);

export interface TatteredEdgeOptions {
  /** How far shreds hang past the edge (min, max). */
  depth: readonly [number, number];
  /** Width of each shred along the edge (min, max). */
  width: readonly [number, number];
  seed: number;
}

/**
 * Points along a torn edge from `from` to `to`, shreds hanging to the right of the direction of
 * travel (left-to-right along a hem hangs downward). Join them into a closed shape with "L".
 */
export function tatteredEdge(from: Point, to: Point, options: TatteredEdgeOptions): Point[] {
  const random = seededRandom(options.seed);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const along = { x: dx / length, y: dy / length };
  const normal = { x: -along.y, y: along.x };
  const points: Point[] = [];
  let travelled = 0;

  while (travelled < length) {
    const width = Math.min(range(random, options.width), length - travelled);
    const depth = range(random, options.depth);
    // A shred: down to a ragged tip (sometimes split in two), back up to the edge.
    const split = random() < 0.25 && width > options.width[0] * 1.4;
    const tips = split ? [0.3, 0.75] : [0.45 + random() * 0.2];
    for (const at of tips) {
      const t = travelled + width * at;
      const hang = depth * (split ? 0.75 + random() * 0.25 : 1);
      points.push({
        x: from.x + along.x * t + normal.x * hang,
        y: from.y + along.y * t + normal.y * hang,
      });
    }
    travelled += width;
    const notch = Math.min(range(random, [0, options.depth[0] * 0.4]), 6);
    points.push({
      x: from.x + along.x * travelled + normal.x * notch,
      y: from.y + along.y * travelled + normal.y * notch,
    });
  }
  return points;
}

/** "L x y" segments for points — to continue a path through them. */
export function lineTo(points: Point[]): string {
  return points.map((p) => `L${point(p)}`).join("");
}

export interface StrandOptions {
  count: number;
  /** Direction the locks flow, in degrees (0 = right, 90 = down), and the spread around it. */
  angle: number;
  spread: number;
  length: readonly [number, number];
  width: readonly [number, number];
  /** Bend toward one side as they flow (degrees over the lock's length). */
  curl: number;
  seed: number;
}

/** Tapered locks flowing from roots spread along `from`→`to` — closed shapes, fill them. */
export function strands(from: Point, to: Point, options: StrandOptions): string[] {
  const random = seededRandom(options.seed);
  const locks: string[] = [];
  for (let index = 0; index < options.count; index++) {
    const t = options.count === 1 ? 0.5 : index / (options.count - 1);
    const root = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    const heading = ((options.angle + (random() - 0.5) * options.spread) * Math.PI) / 180;
    const bend = (options.curl * (0.6 + random() * 0.8) * Math.PI) / 180;
    const length = range(random, options.length);
    const half = range(random, options.width) / 2;

    const mid = {
      x: root.x + Math.cos(heading) * length * 0.55,
      y: root.y + Math.sin(heading) * length * 0.55,
    };
    const tip = {
      x: root.x + Math.cos(heading + bend) * length,
      y: root.y + Math.sin(heading + bend) * length,
    };
    const side = { x: -Math.sin(heading), y: Math.cos(heading) };
    const left = { x: root.x + side.x * half, y: root.y + side.y * half };
    const right = { x: root.x - side.x * half, y: root.y - side.y * half };
    const midLeft = { x: mid.x + side.x * half * 0.7, y: mid.y + side.y * half * 0.7 };
    const midRight = { x: mid.x - side.x * half * 0.7, y: mid.y - side.y * half * 0.7 };
    locks.push(
      `M${point(left)}Q${point(midLeft)} ${point(tip)}Q${point(midRight)} ${point(right)}Z`,
    );
  }
  return locks;
}

export interface ChainLink {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Rotation in degrees, along the chain. */
  angle: number;
}

/**
 * Links along a polyline, `pitch` apart, alternating face-on and edge-on so the chain reads as
 * interlocked rings.
 */
export function chain(path: Point[], pitch: number, size: number): ChainLink[] {
  const segments: { a: Point; b: Point; start: number; length: number; angle: number }[] = [];
  let total = 0;
  for (let index = 0; index < path.length - 1; index++) {
    const a = path[index];
    const b = path[index + 1];
    if (!a || !b) continue;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    segments.push({ a, b, start: total, length, angle });
    total += length;
  }

  const links: ChainLink[] = [];
  for (let distance = pitch / 2, index = 0; distance < total; distance += pitch, index++) {
    const segment = segments.find((s) => distance <= s.start + s.length) ?? segments.at(-1);
    if (!segment) break;
    const t = (distance - segment.start) / segment.length;
    links.push({
      cx: segment.a.x + (segment.b.x - segment.a.x) * t,
      cy: segment.a.y + (segment.b.y - segment.a.y) * t,
      rx: size,
      ry: index % 2 === 0 ? size * 0.58 : size * 0.18,
      angle: segment.angle,
    });
  }
  return links;
}

export interface CrackOptions {
  length: number;
  /** Mean heading in degrees (0 = right, 90 = down). */
  angle: number;
  /** Segment length (min, max) and how sharply it zigzags (degrees). */
  step: readonly [number, number];
  jitter: number;
  /** Chance of a short branch at each joint. */
  branching: number;
  seed: number;
}

/** A jagged fracture with short branches — a single path of open polylines. */
export function crack(start: Point, options: CrackOptions): string {
  const random = seededRandom(options.seed);
  let heading = options.angle;
  let current = start;
  let travelled = 0;
  let main = `M${point(start)}`;
  let branches = "";

  while (travelled < options.length) {
    const step = Math.min(range(random, options.step), options.length - travelled);
    heading = options.angle + (random() - 0.5) * 2 * options.jitter;
    const radians = (heading * Math.PI) / 180;
    current = { x: current.x + Math.cos(radians) * step, y: current.y + Math.sin(radians) * step };
    main += `L${point(current)}`;
    travelled += step;

    if (random() < options.branching && travelled < options.length * 0.85) {
      const side = random() < 0.5 ? -1 : 1;
      const branchAngle = ((heading + side * (35 + random() * 25)) * Math.PI) / 180;
      const branchLength = step * (0.6 + random() * 0.7);
      const tip = {
        x: current.x + Math.cos(branchAngle) * branchLength,
        y: current.y + Math.sin(branchAngle) * branchLength,
      };
      branches += `M${point(current)}L${point(tip)}`;
    }
  }
  return main + branches;
}
