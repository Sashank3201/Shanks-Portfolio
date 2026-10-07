import { seededRandom } from "./random";

export interface Point {
  x: number;
  y: number;
}

export interface Bolt {
  /** The main channel, top to bottom, through every node. */
  main: string;
  /** One short fork per node, splitting off toward alternating sides. */
  forks: string[];
}

const format = (point: Point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

/**
 * A jagged lightning bolt in a box's own pixel space, from the top centre to the bottom through
 * `nodes` (top to bottom). Between nodes it zigzags; seeded, so a layout always gets the same
 * bolt.
 */
export function lightningBolt(width: number, height: number, nodes: Point[], seed = 7): Bolt {
  const random = seededRandom(seed);
  const centre = width / 2;
  const points: Point[] = [{ x: centre, y: 0 }];
  let previous: Point = { x: centre, y: 0 };

  for (const stop of [...nodes, { x: centre, y: height }]) {
    const segments = 3;
    for (let step = 1; step < segments; step++) {
      const swing = (step % 2 === 0 ? -1 : 1) * width * (0.16 + random() * 0.24);
      points.push({ x: centre + swing, y: previous.y + ((stop.y - previous.y) * step) / segments });
    }
    points.push(stop);
    previous = stop;
  }

  const forks = nodes.map((node, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const elbow = {
      x: node.x + side * width * (0.24 + random() * 0.08),
      y: node.y + 10 + random() * 8,
    };
    const tip = {
      x: node.x + side * width * (0.44 + random() * 0.06),
      y: elbow.y + 14 + random() * 10,
    };
    return `M${format(node)}L${format(elbow)}L${format(tip)}`;
  });

  return { main: `M${points.map(format).join("L")}`, forks };
}
