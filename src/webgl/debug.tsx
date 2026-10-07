"use client";

import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Perf } from "r3f-perf";

import { realmSignal } from "@/lib/realm/realm-signal";

/**
 * `?debug` tooling: GPU/frame stats and a realm override for tuning the shaders live.
 * Lazy-loaded, so it never ships to regular visitors.
 */
export default function DebugTools() {
  const { overrideRealm, realm } = useControls("Realm", {
    overrideRealm: false,
    realm: { value: 0, min: 0, max: 1, step: 0.01 },
  });

  useFrame(() => {
    if (overrideRealm) realmSignal.current = realm;
  });

  return <Perf position="bottom-left" minimal />;
}
