"use client";

import { StatsGl } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { monitor, useControls } from "leva";

import { realmSignal } from "@/lib/realm/realm-signal";

/**
 * `?debug` tooling: CPU/GPU frame timings (stats-gl), renderer counters and a realm override for
 * tuning the shaders live. Lazy-loaded, so it never ships to regular visitors.
 */
export default function DebugTools() {
  const gl = useThree((state) => state.gl);

  const { overrideRealm, realm } = useControls("Realm", {
    overrideRealm: false,
    realm: { value: 0, min: 0, max: 1, step: 0.01 },
  });

  // Post-processing resets `gl.info` at the start of each composed frame, so between frames these
  // read the totals of the last one.
  useControls("Renderer", {
    calls: monitor(() => gl.info.render.calls, { graph: false, interval: 250 }),
    triangles: monitor(() => gl.info.render.triangles, { graph: false, interval: 250 }),
    programs: monitor(() => gl.info.programs?.length ?? 0, { graph: false, interval: 1000 }),
  });

  useFrame(() => {
    if (overrideRealm) realmSignal.current = realm;
  });

  return <StatsGl className="fixed bottom-4 left-4 z-(--z-overlay)" />;
}
