"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { Color, Vector2, Vector4, type Mesh, type ShaderMaterial } from "three";

import { getLenis } from "@/lib/motion/scroll";
import { PALETTE } from "@/lib/palette";
import { realmSignal } from "@/lib/realm/realm-signal";
import { getPlanes, subscribePlanes, type TrackedPlane } from "@/lib/scene/plane-registry";
import { clamp, damp } from "@/lib/utils/math";
import { isMotionReduced } from "@/stores/ui-store";

import { FROZEN_TIME } from "../frame";
import { projectFragmentShader, projectVertexShader } from "../shaders/project";

/** Rounded corners of the cover boxes (CSS px) — matches `rounded-2xl`. */
const CORNER_RADIUS = 16;

function createProjectUniforms(plane: TrackedPlane) {
  return {
    uRect: { value: new Vector4() },
    uViewport: { value: new Vector2(1, 1) },
    uBend: { value: 0 },
    uTime: { value: FROZEN_TIME },
    uMotif: { value: plane.motif },
    uSeed: { value: plane.seed },
    uHover: { value: 0 },
    uPointer: { value: new Vector2(0.5, 0.5) },
    uOrigin: { value: new Vector2(0.5, 0.5) },
    uRealm: { value: 0 },
    uAspect: { value: 1 },
    uRadius: { value: 0.02 },
    uSplit: { value: 0 },
    uVoid: { value: new Color(PALETTE.void) },
    uBone: { value: new Color(PALETTE.bone) },
    uSpirit: { value: new Color(PALETTE.spirit) },
    uSpiritDeep: { value: new Color(PALETTE.spiritDeep) },
    uReiatsu: { value: new Color(PALETTE.reiatsu) },
    uEmber: { value: new Color(PALETTE.ember) },
    uMaroon: { value: new Color(PALETTE.maroon) },
  };
}

type ProjectUniforms = ReturnType<typeof createProjectUniforms>;

function ProjectPlane({ plane, octaves }: { plane: TrackedPlane; octaves: number }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const bend = useRef(0);
  const uniforms = useMemo(() => createProjectUniforms(plane), [plane]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const { width, height } = state.size;
    const rect = plane.element.getBoundingClientRect();
    mesh.visible =
      rect.width > 0 &&
      rect.bottom > 0 &&
      rect.top < height &&
      rect.right > -width * 0.1 &&
      rect.left < width * 1.1;
    if (!mesh.visible) return;

    const calm = isMotionReduced();
    const velocity = calm ? 0 : (getLenis()?.velocity ?? 0);
    bend.current = damp(bend.current, clamp(-velocity * 1.6, -48, 48), 6, Math.min(delta, 0.1));

    // R3F hands our uniforms object to the material, so this cast is exact.
    const u = material.uniforms as ProjectUniforms;
    u.uRect.value.set(rect.left, rect.top, rect.width, rect.height);
    u.uViewport.value.set(width, height);
    u.uBend.value = calm ? 0 : bend.current;
    u.uTime.value = calm ? FROZEN_TIME : state.clock.elapsedTime;
    u.uHover.value = plane.hover;
    u.uPointer.value.set(plane.pointer.x, plane.pointer.y);
    u.uOrigin.value.set(plane.origin.x, plane.origin.y);
    u.uRealm.value = realmSignal.current;
    u.uAspect.value = rect.width / rect.height;
    u.uRadius.value = CORNER_RADIUS / rect.height;
    u.uSplit.value = plane.hover * 0.004 + Math.min(Math.abs(velocity) * 0.0004, 0.012);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={1} visible={false}>
      <planeGeometry args={[1, 1, 24, 24]} />
      <shaderMaterial
        // Octaves are a compile-time define: a new tier means a new program.
        key={octaves}
        ref={materialRef}
        vertexShader={projectVertexShader}
        fragmentShader={projectFragmentShader}
        uniforms={uniforms}
        defines={{ FBM_OCTAVES: Math.min(octaves, 4) }}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Project covers drawn where their DOM boxes are (`[data-plane]`, registered by the Work
 * gallery). Each box goes transparent once WebGL is ready, so the stage shows through it.
 */
export function ProjectPlanes({ octaves }: { octaves: number }) {
  const planes = useSyncExternalStore(subscribePlanes, getPlanes, getPlanes);
  return planes.map((plane) => <ProjectPlane key={plane.id} plane={plane} octaves={octaves} />);
}
