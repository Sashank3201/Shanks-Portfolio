"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  Vector2,
  type InstancedBufferAttribute,
  type InstancedBufferGeometry,
  type Mesh,
  type ShaderMaterial,
} from "three";

import { PALETTE } from "@/lib/palette";
import { realmSignal } from "@/lib/realm/realm-signal";
import { MAX_FLAMES, sceneSignal } from "@/lib/scene/scene-signal";
import { isMotionReduced } from "@/stores/ui-store";

import { getScroll } from "../frame";
import { flameFragmentShader, flameVertexShader } from "../shaders/flame";

const QUAD_POSITIONS = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
const QUAD_INDEX = new Uint16Array([0, 1, 2, 0, 2, 3]);

/** Below this the flames are invisible, so the draw is skipped. */
const MIN_INTENSITY = 0.003;

/** Flame size relative to its anchor: big enough to burn past the silhouette in front of it. */
const FLAME_SCALE = 2.6;

function createFlameUniforms() {
  return {
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uScroll: { value: 0 },
    uViewport: { value: new Vector2(1, 1) },
    uScale: { value: FLAME_SCALE },
    uDeep: { value: new Color(PALETTE.blood) },
    uFlame: { value: new Color(PALETTE.reiatsu) },
    uCore: { value: new Color(PALETTE.ember) },
  };
}

type FlameUniforms = ReturnType<typeof createFlameUniforms>;

/**
 * Reiatsu flames at every `[data-flame-anchor]` the stage loader measured. They burn only as the
 * realm turns Hollow (intensity = realm²) and are off under reduced motion, where the static CSS
 * glow at the same anchors stands in.
 */
export function Flames({ octaves }: { octaves: number }) {
  const meshRef = useRef<Mesh>(null);
  const geometryRef = useRef<InstancedBufferGeometry>(null);
  const attributeRef = useRef<InstancedBufferAttribute>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const uploaded = useRef(-1);

  const instances = useMemo(() => new Float32Array(MAX_FLAMES * 4), []);
  const uniforms = useMemo(() => createFlameUniforms(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const attribute = attributeRef.current;
    const material = materialRef.current;
    if (!mesh || !geometry || !attribute || !material) return;

    if (uploaded.current !== sceneSignal.flamesVersion) {
      const flames = sceneSignal.flames.slice(0, MAX_FLAMES);
      flames.forEach((flame, index) => {
        // Golden-ratio seeds keep neighbouring flames out of step.
        instances.set([flame.docX, flame.docY, flame.radius, (index * 0.618034) % 1], index * 4);
      });
      attribute.needsUpdate = true;
      geometry.instanceCount = flames.length;
      uploaded.current = sceneSignal.flamesVersion;
    }

    const realm = realmSignal.current;
    const intensity = realm * realm;
    mesh.visible = !isMotionReduced() && intensity > MIN_INTENSITY && geometry.instanceCount > 0;
    if (!mesh.visible) return;

    // R3F hands our uniforms object to the material, so this cast is exact.
    const u = material.uniforms as FlameUniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uIntensity.value = intensity;
    u.uScroll.value = getScroll();
    u.uViewport.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={2} visible={false}>
      <instancedBufferGeometry ref={geometryRef} instanceCount={0}>
        <bufferAttribute attach="attributes-position" args={[QUAD_POSITIONS, 3]} />
        <bufferAttribute attach="index" args={[QUAD_INDEX, 1]} />
        <instancedBufferAttribute
          ref={attributeRef}
          attach="attributes-aFlame"
          args={[instances, 4]}
          usage={DynamicDrawUsage}
        />
      </instancedBufferGeometry>
      <shaderMaterial
        // Octaves are a compile-time define: a new tier means a new program.
        key={octaves}
        ref={materialRef}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        defines={{ FBM_OCTAVES: Math.min(octaves, 4) }}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
