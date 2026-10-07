"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Vector2, Vector3, Vector4, type ShaderMaterial } from "three";

import { PALETTE } from "@/lib/palette";
import { realmSignal } from "@/lib/realm/realm-signal";
import { sceneSignal } from "@/lib/scene/scene-signal";
import { damp } from "@/lib/utils/math";
import { isMotionReduced, useUiStore } from "@/stores/ui-store";

import { computeComposition, hasEmerged, type SkyComposition } from "../composition";
import { FROZEN_TIME, getScroll } from "../frame";
import { skyFragmentShader, skyVertexShader } from "../shaders/sky";
import { moonCircle, skyState } from "../sky-state";

/** One triangle that covers the screen (cheaper than a quad: no diagonal seam). */
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);

/** Eclipse placement follows the scrubbed dive directly; damping it too would lag the fall. */
const ECLIPSE_KEYS = new Set<keyof SkyComposition>(["eclipseX", "eclipseY", "eclipseRadius"]);

const COMPOSITION_KEYS: (keyof SkyComposition)[] = [
  "eclipseX",
  "eclipseY",
  "eclipseRadius",
  "eclipseVisibility",
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
    uDive: { value: 0 },
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
  const emerged = useRef(false);
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
    const dive = calm ? 0 : sceneSignal.dive;
    const emerge = calm ? 0 : sceneSignal.emerge;
    const target = computeComposition({
      width,
      height,
      scroll: calm ? 0 : getScroll(),
      docHeight: sceneSignal.docHeight,
      anchor: sceneSignal.anchor,
      dive,
      emerge,
    });

    // Crossing between the dive and the resting sky happens while the moon fills the screen,
    // so the placement can cut; only the visibility fades.
    const isEmerged = hasEmerged(dive, emerge);
    const cut = isEmerged !== emerged.current;
    emerged.current = isEmerged;
    const diving = dive > 0 && !isEmerged;

    const current = (composition.current ??= { ...target });
    // Entering the resting sky starts invisible and fades in; leaving it is hidden by the moon.
    if (cut) current.eclipseVisibility = isEmerged ? 0 : 1;
    for (const key of COMPOSITION_KEYS) {
      const follow = calm || ((cut || diving) && ECLIPSE_KEYS.has(key));
      current[key] = follow ? target[key] : damp(current[key], target[key], 5, dt);
    }

    pointer.current.x = calm ? 0 : damp(pointer.current.x, sceneSignal.pointer.x, 2.5, dt);
    pointer.current.y = calm ? 0 : damp(pointer.current.y, sceneSignal.pointer.y, 2.5, dt);

    // R3F hands our uniforms object to the material, so this cast is exact.
    const u = material.uniforms as SkyUniforms;
    u.uTime.value = calm ? FROZEN_TIME : state.clock.elapsedTime;
    u.uAspect.value = width / height;
    u.uRealm.value = realmSignal.current;
    u.uEclipseReveal.value = sceneSignal.eclipseReveal * current.eclipseVisibility;
    u.uDive.value = dive;
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

    // Publish the moon for the layers drawn over the sky (same parallax as the shader).
    const moon = moonCircle(
      current.eclipseX + pointer.current.x * 0.006,
      current.eclipseY + pointer.current.y * 0.006,
      current.eclipseRadius,
      realmSignal.current,
      dive,
    );
    skyState.moonX = moon.x;
    skyState.moonY = moon.y;
    skyState.moonRadius =
      moon.radius * (sceneSignal.eclipseReveal * current.eclipseVisibility > 0.5 ? 1 : 0);
    skyState.aspect = width / height;
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
