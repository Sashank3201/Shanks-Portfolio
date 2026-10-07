import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { Cleaver } from "./cleaver";
import { CloakedFigure, FIGURE_FLAMES } from "./cloaked-figure";
import { CrescentMark } from "./crescent-mark";
import { Gate } from "./gate";
import { HornedMask } from "./horned-mask";
import { Seal } from "./seal";
import { SpireSilhouette } from "./spire-silhouette";

const DRAWN: [string, ReactElement][] = [
  ["HornedMask", <HornedMask key="mask" />],
  ["CloakedFigure", <CloakedFigure key="figure" />],
  ["Cleaver", <Cleaver key="cleaver" />],
  ["Gate", <Gate key="gate" />],
  ["Seal", <Seal key="seal" glyph="技" />],
];

describe("illustrations", () => {
  it.each([
    ...DRAWN,
    ["CrescentMark", <CrescentMark key="crescent" />],
    ["SpireSilhouette", <SpireSilhouette key="spire" />],
  ] as [string, ReactElement][])("%s is decorative", (_name, element) => {
    const { container } = render(element);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it.each(DRAWN)("%s has strokes that can draw themselves", (_name, element) => {
    const { container } = render(element);
    expect(container.querySelectorAll("[data-draw]").length).toBeGreaterThan(0);
  });

  it("marks every flame anchor of the cloaked figure", () => {
    const { container } = render(<CloakedFigure />);
    const anchors = [...container.querySelectorAll("[data-flame-anchor]")];
    expect(anchors.map((circle) => [circle.getAttribute("cx"), circle.getAttribute("cy")])).toEqual(
      FIGURE_FLAMES.map(({ x, y }) => [String(x), String(y)]),
    );
  });

  it("gives each spire its own fade mask", () => {
    const { container } = render(
      <>
        <SpireSilhouette />
        <SpireSilhouette />
      </>,
    );
    const masks = [...container.querySelectorAll("mask")].map((mask) => mask.id);
    expect(new Set(masks).size).toBe(2);
    for (const path of container.querySelectorAll("path[mask]")) {
      const id = /^url\(#(.+)\)$/.exec(path.getAttribute("mask") ?? "")?.[1];
      expect(id && masks.includes(id)).toBe(true);
    }
  });

  it("can drop the spire's fade", () => {
    const { container } = render(<SpireSilhouette fade={false} />);
    expect(container.querySelector("mask")).toBeNull();
    expect(container.querySelector("path")).not.toHaveAttribute("mask");
  });
});
