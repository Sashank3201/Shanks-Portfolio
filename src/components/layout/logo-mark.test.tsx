import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CRESCENT_PATH, MASK_PATH } from "@/components/illustrations/logo-paths";
import { loadMorphSVG } from "@/lib/motion/lazy-plugins";
import { useUiStore } from "@/stores/ui-store";

import { LogoMark } from "./logo-mark";

vi.mock("@/lib/motion/lazy-plugins", () => ({ loadMorphSVG: vi.fn() }));

const pending = () => new Promise<never>(() => undefined);

function renderLogo() {
  const { container } = render(<LogoMark />);
  const svg = container.querySelector("svg");
  const morph = container.querySelector<SVGPathElement>("[data-logo-morph]");
  if (!svg || !morph) throw new Error("LogoMark did not render its morph layer");
  return { svg, morph };
}

function setRelease(release: boolean) {
  act(() => {
    useUiStore.setState({ release });
  });
}

describe("LogoMark", () => {
  beforeEach(() => {
    vi.mocked(loadMorphSVG).mockImplementation(pending);
    useUiStore.setState({
      release: false,
      motionPreference: "system",
      systemReducedMotion: false,
      staticMode: false,
    });
  });

  afterEach(() => {
    vi.mocked(loadMorphSVG).mockReset();
  });

  it("starts in sync with the realm, without morphing", () => {
    const { svg, morph } = renderLogo();

    expect(morph.dataset.shape).toBe("crescent");
    expect(morph.getAttribute("d")).toBe(CRESCENT_PATH);
    expect(svg).not.toHaveAttribute("data-morphing");
  });

  it("starts as the mask when Release was already on", () => {
    useUiStore.setState({ release: true });
    const { svg, morph } = renderLogo();

    expect(morph.dataset.shape).toBe("mask");
    expect(morph.getAttribute("d")).toBe(MASK_PATH);
    expect(svg).not.toHaveAttribute("data-morphing");
  });

  it("hands over to the morph layer when Release changes", () => {
    const { svg, morph } = renderLogo();
    setRelease(true);

    expect(svg).toHaveAttribute("data-morphing");
    expect(morph.dataset.shape).toBe("mask");
  });

  it("swaps instantly under reduced motion", () => {
    useUiStore.setState({ motionPreference: "reduce" });
    const { svg, morph } = renderLogo();
    setRelease(true);

    expect(svg).not.toHaveAttribute("data-morphing");
    expect(morph.getAttribute("d")).toBe(MASK_PATH);
    expect(loadMorphSVG).not.toHaveBeenCalled();
  });

  it("cuts to the new shape if MorphSVG cannot load", async () => {
    vi.mocked(loadMorphSVG).mockRejectedValue(new Error("offline"));
    const { svg, morph } = renderLogo();
    setRelease(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(svg).not.toHaveAttribute("data-morphing");
    expect(morph.getAttribute("d")).toBe(MASK_PATH);
  });
});
