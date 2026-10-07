import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadDrawSVG } from "@/lib/motion/lazy-plugins";
import { useUiStore } from "@/stores/ui-store";

import { DrawOnScroll } from "./draw-on-scroll";

vi.mock("@/lib/motion/lazy-plugins", () => ({ loadDrawSVG: vi.fn() }));

function Art() {
  return (
    <svg>
      <path data-draw d="M0 0L10 10" />
    </svg>
  );
}

function renderDrawing() {
  const { container } = render(
    <DrawOnScroll>
      <Art />
    </DrawOnScroll>,
  );
  const root = container.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("DrawOnScroll did not render its wrapper");
  return root;
}

describe("DrawOnScroll", () => {
  beforeEach(() => {
    useUiStore.setState({
      motionPreference: "system",
      systemReducedMotion: false,
      staticMode: false,
    });
  });

  afterEach(() => {
    vi.mocked(loadDrawSVG).mockReset();
  });

  it("leaves the art complete under reduced motion and never loads DrawSVG", () => {
    useUiStore.setState({ motionPreference: "reduce" });
    const root = renderDrawing();

    expect(root.style.visibility).toBe("");
    expect(loadDrawSVG).not.toHaveBeenCalled();
  });

  it("hides the art until DrawSVG is in, so it never flashes complete", () => {
    vi.mocked(loadDrawSVG).mockReturnValue(new Promise(() => undefined));
    const root = renderDrawing();

    expect(loadDrawSVG).toHaveBeenCalledOnce();
    expect(root.style.visibility).toBe("hidden");
  });

  it("shows the finished art if DrawSVG cannot load", async () => {
    vi.mocked(loadDrawSVG).mockRejectedValue(new Error("offline"));
    const root = renderDrawing();

    await act(async () => {
      await Promise.resolve();
    });

    expect(root.style.visibility).not.toBe("hidden");
    expect(root.style.opacity).toBe("1");
  });
});
