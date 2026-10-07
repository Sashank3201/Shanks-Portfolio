"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, advance, useThree } from "@react-three/fiber";
import { Suspense, lazy, useEffect, useState } from "react";

import { gsap } from "@/lib/motion/gsap";
import { realmSignal } from "@/lib/realm/realm-signal";
import { isMotionReduced } from "@/stores/ui-store";

import { Effects } from "./effects";
import { takeFrameRequest } from "./frame";
import {
  QUALITY,
  detectTier,
  readDeviceHints,
  readRenderer,
  type QualitySettings,
} from "./quality";
import { AshField } from "./scenes/ash-field";
import { Flames } from "./scenes/flames";
import { Sky } from "./scenes/sky";

const DebugTools = lazy(() => import("./debug"));

export interface StageProps {
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
}

/**
 * The persistent WebGL stage: one canvas, one GL context for the whole site, rendered on the
 * shared gsap.ticker clock (frameloop "never" + advance). Quality starts from device hints and
 * adapts to measured frame rate.
 */
export default function Stage({ onReady, onContextLost, onContextRestored }: StageProps) {
  const [quality, setQuality] = useState<QualitySettings>(
    () => QUALITY[detectTier(readDeviceHints())],
  );
  const [dprScale, setDprScale] = useState(1);
  const debug = typeof window !== "undefined" && /[?&]debug(=|&|$)/.test(window.location.search);

  return (
    <Canvas
      frameloop="never"
      flat
      dpr={[1, Math.max(1, quality.maxDpr * dprScale)]}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      onCreated={({ gl }) => {
        // Refine the tier once the actual GPU is known (e.g. software renderers → tier 1).
        const renderer = readRenderer(gl.getContext());
        const refined = detectTier(readDeviceHints(renderer));
        if (refined < quality.tier) setQuality(QUALITY[refined]);

        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
        canvas.addEventListener("webglcontextrestored", onContextRestored);
      }}
    >
      <Clock onFirstFrame={onReady} />
      <Sky octaves={quality.octaves} vignette={!quality.postprocessing} />
      <AshField count={quality.particles} />
      <Flames octaves={quality.octaves} />
      {quality.postprocessing ? (
        <Effects chromaticAberration={quality.chromaticAberration} />
      ) : null}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          setDprScale((scale) => Math.max(0.6, scale - 0.15));
        }}
        onIncline={() => {
          setDprScale((scale) => Math.min(1, scale + 0.1));
        }}
        onFallback={() => {
          setQuality(QUALITY[1]);
        }}
      />
      {debug ? (
        <Suspense fallback={null}>
          <DebugTools />
        </Suspense>
      ) : null}
    </Canvas>
  );
}

/**
 * Drives rendering from gsap.ticker so Lenis, ScrollTrigger and WebGL share one clock.
 * Shaders are compiled before the first frame; under reduced motion / static mode the stage
 * only renders when something visible changed (realm, size, an explicit frame request).
 */
function Clock({ onFirstFrame }: { onFirstFrame: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    let active = true;
    // A call, not a variable read, so narrowing can't go stale across the await below.
    const isActive = () => active;
    let started = false;
    let lastRealm = Number.NaN;

    const tick = (time: number) => {
      if (isMotionReduced()) {
        const realm = realmSignal.current;
        if (realm === lastRealm && !takeFrameRequest()) return;
        lastRealm = realm;
      }
      advance(time);
    };

    void (async () => {
      // Parallel compilation keeps the main thread free where the GPU driver supports it;
      // otherwise compile up front synchronously so the first frame doesn't hitch mid-preloader.
      if (gl.extensions.has("KHR_parallel_shader_compile")) {
        await gl.compileAsync(scene, camera);
      } else {
        gl.compile(scene, camera);
      }
      if (!isActive()) return;
      advance(gsap.ticker.time);
      started = true;
      onFirstFrame();
      gsap.ticker.add(tick);
    })();

    return () => {
      active = false;
      if (started) gsap.ticker.remove(tick);
    };
  }, [gl, scene, camera, onFirstFrame]);

  // A resize must repaint even when idling.
  useEffect(() => {
    if (isMotionReduced()) advance(gsap.ticker.time);
  }, [size]);

  return null;
}
