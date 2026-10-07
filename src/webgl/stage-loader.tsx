"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { ErrorBoundary } from "@/components/providers/error-boundary";
import { holdBoot } from "@/lib/boot/ready";
import { sceneSignal } from "@/lib/scene/scene-signal";

import { getScroll, requestStageFrame } from "./frame";
import { isSoftwareRenderer, readRenderer } from "./quality";

const Stage = dynamic(() => import("./stage"), { ssr: false });

/** Generous ceiling: the preloader never waits on WebGL longer than this. */
const READY_TIMEOUT_MS = 4000;

let webglSupport: boolean | undefined;

/**
 * Whether to run the WebGL stage. Requires WebGL2 on real hardware: without a GPU (software
 * rasterisers such as SwiftShader or llvmpipe) a full-screen shader would stall the main thread,
 * so those visitors keep the CSS eclipse — as do visitors who asked to save data.
 * `?webgl=force` overrides the hardware check (used by WebGL end-to-end tests).
 * Cached after the first probe.
 */
function canRenderStage(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  const forced = /[?&]webgl=force(&|$)/.test(window.location.search);
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData && !forced) return (webglSupport = false);
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return (webglSupport = false);
    const software = isSoftwareRenderer(readRenderer(gl));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    webglSupport = forced || !software;
  } catch {
    webglSupport = false;
  }
  if (!webglSupport) document.documentElement.dataset.webgl = "fallback";
  return webglSupport;
}

const subscribeNever = () => () => undefined;

function setWebGLState(state: "ready" | "lost" | "failed") {
  document.documentElement.dataset.webgl = state;
}

/**
 * Mounts the WebGL stage behind the content (lazily, client-only) and keeps the scene informed
 * of the DOM: the hero eclipse anchor, document height and pointer. Until the first frame is
 * drawn — or forever, without WebGL — the CSS eclipse carries the look.
 */
export function StageLoader() {
  const supported = useSyncExternalStore(subscribeNever, canRenderStage, () => false);
  const pathname = usePathname();
  const settle = useRef<(() => void) | null>(null);

  // Let the preloader wait for the first WebGL frame (bounded by a timeout).
  useEffect(() => {
    if (!supported) return;
    const ready = new Promise<void>((resolve) => {
      settle.current = resolve;
      window.setTimeout(resolve, READY_TIMEOUT_MS);
    });
    holdBoot(ready);
  }, [supported]);

  // Measure the page for the scene whenever it changes.
  useEffect(() => {
    const measure = () => {
      const anchor = document.querySelector<HTMLElement>("[data-eclipse-anchor]");
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        sceneSignal.anchor = {
          docX: rect.left + rect.width / 2,
          docY: rect.top + rect.height / 2 + getScroll(),
          radius: rect.width / 2,
        };
      } else {
        sceneSignal.anchor = null;
      }
      sceneSignal.docHeight = document.documentElement.scrollHeight;
      requestStageFrame();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      sceneSignal.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      sceneSignal.pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const handleReady = useCallback(() => {
    setWebGLState("ready");
    settle.current?.();
  }, []);
  const handleContextLost = useCallback(() => {
    setWebGLState("lost");
  }, []);
  const handleFailure = useCallback(() => {
    setWebGLState("failed");
    settle.current?.();
  }, []);

  if (!supported) return null;

  return (
    <div aria-hidden="true" className="stage pointer-events-none fixed inset-0 -z-10">
      <ErrorBoundary onError={handleFailure}>
        <Stage
          onReady={handleReady}
          onContextLost={handleContextLost}
          onContextRestored={handleReady}
        />
      </ErrorBoundary>
    </div>
  );
}
