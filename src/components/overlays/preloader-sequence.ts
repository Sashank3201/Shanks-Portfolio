import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { bootTasksSettled, delay, fontsReady, pageLoaded } from "@/lib/boot/ready";
import { EASE, gsap } from "@/lib/motion/gsap";
import { PRELOADED_SESSION_KEY } from "@/lib/realm/prefs";
import { useUiStore } from "@/stores/ui-store";

gsap.registerPlugin(DrawSVGPlugin);

/** The preloader never holds the visitor longer than this, whatever is still loading. */
const MAX_WAIT_MS = 4500;

export interface PreloaderElements {
  root: HTMLElement;
  stage: HTMLElement;
  ring: SVGCircleElement;
  moon: SVGCircleElement;
  corona: HTMLElement;
  counter: HTMLElement;
  meta: HTMLElement;
}

/**
 * "The eclipse forms". Loaded on demand — only first visits of a session ever download it.
 * Returns a disposer that stops the sequence.
 */
export function playPreloader({
  root,
  stage,
  ring,
  moon,
  corona,
  counter: counterEl,
  meta,
}: PreloaderElements): () => void {
  const lifecycle = new AbortController();
  // A call (not a property read) so control-flow narrowing can't go stale across awaits.
  const cancelled = () => lifecycle.signal.aborted;
  const animations: gsap.core.Animation[] = [];
  const track = <T extends gsap.core.Animation>(animation: T): T => {
    animations.push(animation);
    return animation;
  };

  const counter = { value: 0 };
  const writeCounter = () => {
    counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
  };

  const run = async () => {
    // 1 — the ring draws and the counter climbs while the page gets ready.
    const drawing = track(
      gsap
        .timeline()
        .fromTo(
          ring,
          { drawSVG: "50% 50%" },
          { drawSVG: "0% 100%", duration: 1.5, ease: EASE.slash },
          0,
        )
        .to(counter, { value: 82, duration: 1.5, ease: "power2.inOut", onUpdate: writeCounter }, 0),
    );
    await Promise.race([
      Promise.all([fontsReady(), pageLoaded(), bootTasksSettled(), drawing]),
      delay(MAX_WAIT_MS),
    ]);
    if (cancelled()) return;

    // 2 — the eclipse forms.
    await track(
      gsap
        .timeline()
        .to(counter, { value: 100, duration: 0.5, ease: "power2.out", onUpdate: writeCounter }, 0)
        .to(moon, { attr: { cx: 104.9 }, duration: 0.95, ease: EASE.reiatsu }, 0)
        .fromTo(
          corona,
          { opacity: 0, scale: 0.55 },
          { opacity: 1, scale: 1, duration: 1.1, ease: EASE.reiatsu },
          0.15,
        ),
    );
    if (cancelled()) return;

    // 3 — hand off to the hero eclipse and lift the veil.
    sessionStorage.setItem(PRELOADED_SESSION_KEY, "1");
    const exit = track(
      gsap.timeline({
        onComplete: () => {
          document.documentElement.removeAttribute("data-loading");
        },
      }),
    );
    const anchor = document.querySelector<HTMLElement>("[data-eclipse-anchor]");
    if (anchor) {
      const from = stage.getBoundingClientRect();
      const to = anchor.getBoundingClientRect();
      // The ring spans 70% of the stage's viewBox; the anchor's border box is the ring.
      exit.to(
        stage,
        {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: to.width / (from.width * 0.7),
          duration: 1.15,
          ease: EASE.slash,
        },
        0,
      );
    }
    exit
      .to(meta, { opacity: 0, y: 16, duration: 0.4, ease: "power2.in" }, 0)
      .to(root, { "--veil": 0, duration: 0.9, ease: "power2.inOut" }, 0.25)
      .to(stage, { opacity: 0, duration: 0.45, ease: "power1.out" }, 0.95)
      // Let the hero choreography start while the veil is still lifting.
      .call(() => useUiStore.getState().setBootPhase("intro"), undefined, 0.55);
  };

  void run();

  return () => {
    lifecycle.abort();
    for (const animation of animations) animation.kill();
  };
}
