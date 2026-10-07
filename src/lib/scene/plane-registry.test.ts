import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPlane,
  getPlanes,
  MAX_PLANES,
  registerPlane,
  subscribePlanes,
} from "./plane-registry";

const removals: (() => void)[] = [];
function track(plane = createPlane(document.createElement("div"), 0, 0.5)) {
  const remove = registerPlane(plane);
  removals.push(remove);
  return { plane, remove };
}

describe("plane registry", () => {
  afterEach(() => {
    for (const remove of removals.splice(0)) remove();
  });

  it("registers and removes planes, publishing a new list each time", () => {
    const listener = vi.fn();
    const unsubscribe = subscribePlanes(listener);
    const before = getPlanes();

    const { plane, remove } = track();
    expect(getPlanes()).toEqual([plane]);
    expect(getPlanes()).not.toBe(before);

    remove();
    expect(getPlanes()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("ignores duplicates and removing twice", () => {
    const { plane, remove } = track();
    registerPlane(plane);
    expect(getPlanes()).toHaveLength(1);
    remove();
    remove();
    expect(getPlanes()).toHaveLength(0);
  });

  it("caps the number of planes", () => {
    for (let index = 0; index < MAX_PLANES + 3; index++) track();
    expect(getPlanes()).toHaveLength(MAX_PLANES);
  });

  it("starts planes centred and at rest", () => {
    const plane = createPlane(document.createElement("div"), 2, 0.25);
    expect(plane).toMatchObject({ motif: 2, seed: 0.25, hover: 0, pointer: { x: 0.5, y: 0.5 } });
  });
});
