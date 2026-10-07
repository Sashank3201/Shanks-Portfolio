"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Vector2, Vector3, Vector4, type ShaderMaterial } from "three";

import { PALETTE } from "@/lib/palette";
import { realmSignal } from "@/lib/realm/realm-signal";
import { sceneSignal } from "@/lib/scene/scene-signal";
import { damp } from "@/lib/utils/math";
import { isMotionReduced, useUiStore } from "@/stores/ui-store";

import { computeComposition, type SkyComposition } from "../composition";
import { FROZEN_TIME, getScroll } from "../frame";
import { skyFragmentShader, skyVertexShader } from "../shaders/sky";

/** One triangle that covers the screen (cheaper than a quad: no diagonal seam). */
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);

const COMPOSITION_KEYS: (keyof SkyComposition)[] = [
  "eclipseX",
  "eclipseY",
  "eclipseRadius",
  "spireX",
  "spireBaseY",
  "spireScale",
  "spireVisibility",
  "beam",
  "clouds",
  "corona",
];

function createSkyUniforms() {
  return {
    uTime: { value: FROZEN_TIME },
    uAspect: { value: 1 },
    uRealm: { value: 0 },
    uEclipse: { value: new Vector3(0, 0.2, 0.15) },
    uEclipseReveal: { value: 1 },
    uSpire: { value: new Vector4(0, -0.5, 0.5, 0) },
    uBeam: { value: 0 },
    uClouds: { value: 1 },
    uCorona: { value: 1 },
    uVignette: { value: 0 },
    uPointer: { value: new Vector2() },
    uVoid: { value: new Color(PALETTE.void) },
    uBone: { value: new Color(PALETTE.bone) },
    uSpirit: { value: new Color(PALETTE.spirit) },
    uReiatsu: { value: new Color(PALETTE.reiatsu) },
    uEmber: { value: new Color(PALETTE.ember) },
    uMaroon: { value: new Color(PALETTE.maroon) },
  };
}

type SkyUniforms = ReturnType<typeof createSkyUniforms>;

interface SkyProps {
  /** fbm octaves for the current quality tier. */
  octaves: number;
  /** Shader vignette, used when post-processing (which has its own) is off. */
  vignette: boolean;
}

export function Sky({ octaves, vignette }: SkyProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const composition = useRef<SkyComposition | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => createSkyUniforms(), []);

  // A new preloader run starts with the WebGL eclipse hidden; the hero intro reveals it.
  useEffect(() => {
    if (useUiStore.getState().bootPhase === "loading") sceneSignal.eclipseReveal = 0;
  }, []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const calm = isMotionReduced();
    const dt = Math.min(delta, 0.1);
    const { width, height } = state.size;
    const target = computeComposition({
      width,
      height,
      scroll: calm ? 0 : getScroll(),
      docHeight: sceneSignal.docHeight,
      anchor: sceneSignal.anchor,
    });

    const current = (composition.current ??= { ...target });
    for (const key of COMPOSITION_KEYS) {
      current[key] = calm ? target[key] : damp(current[key], target[key], 5, dt);
    }

    pointer.current.x = calm ? 0 : damp(pointer.current.x, sceneSignal.pointer.x, 2.5, dt);
    pointer.current.y = calm ? 0 : damp(pointer.current.y, sceneSignal.pointer.y, 2.5, dt);

    // R3F hands our uniforms object to the material, so this cast is exact.
    const u = material.uniforms as SkyUniforms;
    u.uTime.value = calm ? FROZEN_TIME : state.clock.elapsedTime;
    u.uAspect.value = width / height;
    u.uRealm.value = realmSignal.current;
    u.uEclipseReveal.value = sceneSignal.eclipseReveal;
    u.uVignette.value = vignette ? 1 : 0;
    u.uEclipse.value.set(current.eclipseX, current.eclipseY, current.eclipseRadius);
    u.uSpire.value.set(
      current.spireX,
      current.spireBaseY,
      current.spireScale,
      current.spireVisibility,
    );
    u.uBeam.value = current.beam;
    u.uClouds.value = current.clouds;
    u.uCorona.value = current.corona;
    u.uPointer.value.set(pointer.current.x, pointer.current.y);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[FULLSCREEN_TRIANGLE, 3]} />
      </bufferGeometry>
      <shaderMaterial
        // Octaves are a compile-time define: a new tier means a new program.
        key={octaves}
        ref={materialRef}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        defines={{ FBM_OCTAVES: octaves }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
