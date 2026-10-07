import { describe, expect, it } from "vitest";

import { measureFlames } from "./measure-flames";
import { MAX_FLAMES } from "./scene-signal";

function anchor(left: number, top: number, size: number): Element {
  const element = document.createElement("span");
  element.setAttribute("data-flame-anchor", "");
  element.getBoundingClientRect = () => new DOMRect(left, top, size, size);
  return element;
}

describe("measureFlames", () => {
  it("converts anchor rects to document-space centres and radii", () => {
    const root = document.createElement("div");
    root.append(anchor(100, 40, 20), anchor(300, -60, 10));

    expect(measureFlames(500, root)).toEqual([
      { docX: 110, docY: 550, radius: 10 },
      { docX: 305, docY: 445, radius: 5 },
    ]);
  });

  it("skips anchors that are not rendered", () => {
    const root = document.createElement("div");
    root.append(anchor(0, 0, 0), anchor(10, 10, 4));

    expect(measureFlames(0, root)).toEqual([{ docX: 12, docY: 12, radius: 2 }]);
  });

  it("caps the list at the instance budget", () => {
    const root = document.createElement("div");
    for (let index = 0; index < MAX_FLAMES + 5; index++) root.append(anchor(index, 0, 2));

    expect(measureFlames(0, root)).toHaveLength(MAX_FLAMES);
  });
});
