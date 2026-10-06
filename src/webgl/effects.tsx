"use client";

import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";

import { getLenis } from "@/lib/motion/scroll";
import { damp } from "@/lib/utils/math";
import { isMotionReduced } from "@/stores/ui-store";

/**
 * Post-processing for tiers 2–3: bloom carries the corona, ring, beam and embers; a vignette
 * frames the sky; on tier 3 a whisper of chromatic aberration follows scroll velocity.
 */
export function Effects({ chromaticAberration }: { chromaticAberration: boolean }) {
  return chromaticAberration ? (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.55} luminanceSmoothing={0.25} />
      <Vignette offset={0.28} darkness={0.7} />
      <VelocityAberration />
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.55} luminanceSmoothing={0.25} />
      <Vignette offset={0.28} darkness={0.7} />
    </EffectComposer>
  );
}

function VelocityAberration() {
  const effectRef = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new Vector2(0, 0), []);
  const strength = useRef(0);

  useFrame((_, delta) => {
    const velocity = isMotionReduced() ? 0 : Math.abs(getLenis()?.velocity ?? 0);
    strength.current = damp(strength.current, Math.min(velocity * 0.00012, 0.0035), 6, delta);
    effectRef.current?.offset.set(strength.current, strength.current * 0.6);
  });

  return (
    <ChromaticAberration ref={effectRef} offset={offset} radialModulation modulationOffset={0.3} />
  );
}
