"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Vector3, type ShaderMaterial } from "three";

import { PALETTE } from "@/lib/palette";
import { realmSignal } from "@/lib/realm/realm-signal";
import { lerp } from "@/lib/utils/math";
import { isMotionReduced } from "@/stores/ui-store";

import { FROZEN_TIME, getScroll, seededRandom } from "../frame";
import { ashFragmentShader, ashVertexShader } from "../shaders/ash";
import { skyState } from "../sky-state";

function createAshUniforms() {
  return {
    uTime: { value: FROZEN_TIME },
    uFlow: { value: 0 },
    uScroll: { value: 0 },
    uRealm: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 2.2 },
    uMoon: { value: new Vector3() },
    uAspect: { value: 1 },
    uAsh: { value: new Color(PALETTE.ash200) },
    uEmber: { value: new Color(PALETTE.ember) },
    uReiatsu: { value: new Color(PALETTE.reiatsu) },
  };
}

type AshUniforms = ReturnType<typeof createAshUniforms>;

/** Drifting ash in the Shinigami realm; rising embers in the Hollow. */
export function AshField({ count }: { count: number }) {
  const materialRef = useRef<ShaderMaterial>(null);
  const flow = useRef(0);

  const { positions, seeds } = useMemo(() => {
    const random = seededRandom(0x5eed + count);
    const seedArray = new Float32Array(count * 3);
    for (let index = 0; index < seedArray.length; index++) seedArray[index] = random();
    // Positions are computed in the vertex shader; the attribute only sets the draw count.
    return { positions: new Float32Array(count * 3), seeds: seedArray };
  }, [count]);

  const uniforms = useMemo(() => createAshUniforms(), []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const calm = isMotionReduced();
    const realm = realmSignal.current;
    // Integrated, so reversing direction (ash falls → embers rise) never jumps.
    if (!calm) flow.current += Math.min(delta, 0.1) * lerp(-1, 1.4, realm);

    // R3F hands our uniforms object to the material, so this cast is exact.
    const u = material.uniforms as AshUniforms;
    u.uTime.value = calm ? FROZEN_TIME : state.clock.elapsedTime;
    u.uFlow.value = flow.current;
    u.uScroll.value = calm ? 0 : getScroll() / state.size.height;
    u.uRealm.value = realm;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uMoon.value.set(skyState.moonX, skyState.moonY, skyState.moonRadius);
    u.uAspect.value = skyState.aspect;
  });

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={ashVertexShader}
        fragmentShader={ashFragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
