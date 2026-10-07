import { describe, expect, it } from "vitest";

import { lightningBolt } from "./bolt";

const nodes = [
  { x: 80, y: 200 },
  { x: 80, y: 600 },
  { x: 80, y: 1000 },
];

describe("lightningBolt", () => {
  it("is deterministic for a seed and varies between seeds", () => {
    expect(lightningBolt(160, 1200, nodes, 3)).toEqual(lightningBolt(160, 1200, nodes, 3));
    expect(lightningBolt(160, 1200, nodes, 3).main).not.toBe(
      lightningBolt(160, 1200, nodes, 4).main,
    );
  });

  it("runs from the top centre to the bottom through every node", () => {
    const { main } = lightningBolt(160, 1200, nodes);
    expect(main.startsWith("M80.0 0.0L")).toBe(true);
    expect(main.endsWith("L80.0 1200.0")).toBe(true);
    for (const node of nodes) expect(main).toContain(`${node.x.toFixed(1)} ${node.y.toFixed(1)}`);
  });

  it("splits one fork off each node, alternating sides", () => {
    const { forks } = lightningBolt(160, 1200, nodes);
    expect(forks).toHaveLength(nodes.length);
    const tipX = (fork: string) => Number(fork.split("L").at(-1)?.split(" ")[0]);
    expect(tipX(forks[0] ?? "")).toBeLessThan(80);
    expect(tipX(forks[1] ?? "")).toBeGreaterThan(80);
  });

  it("stays inside a small horizontal band around the centre", () => {
    const { main } = lightningBolt(160, 1200, nodes, 11);
    const xs = main
      .slice(1)
      .split("L")
      .map((pair) => Number(pair.split(" ")[0]));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(80 - 160 * 0.4);
    expect(Math.max(...xs)).toBeLessThanOrEqual(80 + 160 * 0.4);
  });
});
