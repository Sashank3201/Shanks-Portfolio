export type QualityTier = 1 | 2 | 3;

export interface QualitySettings {
  tier: QualityTier;
  /** Upper bound for the canvas pixel ratio. */
  maxDpr: number;
  /** fbm octaves in the sky shader (compile-time define). */
  octaves: number;
  particles: number;
  postprocessing: boolean;
  chromaticAberration: boolean;
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  1: {
    tier: 1,
    maxDpr: 1,
    octaves: 3,
    particles: 500,
    postprocessing: false,
    chromaticAberration: false,
  },
  2: {
    tier: 2,
    maxDpr: 1.5,
    octaves: 4,
    particles: 1300,
    postprocessing: true,
    chromaticAberration: false,
  },
  3: {
    tier: 3,
    maxDpr: 1.75,
    octaves: 5,
    particles: 2400,
    postprocessing: true,
    chromaticAberration: true,
  },
};

export interface DeviceHints {
  coarsePointer: boolean;
  shortestScreenSide: number;
  cores: number;
  memoryGb: number;
  /** Unmasked GPU renderer string, when the browser exposes it. */
  renderer?: string;
}

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render/i;

/** True for CPU rasterisers (no GPU acceleration). */
export function isSoftwareRenderer(renderer: string | undefined): boolean {
  return renderer !== undefined && SOFTWARE_RENDERER.test(renderer);
}
const LOW_END_GPU =
  /mali-[gt]\d{1,2}\b|adreno \(tm\) [3-5]\d{2}|powervr|intel\(r\) (hd|uhd) graphics [2-6]\d{2}\b/i;

/**
 * Initial tier from cheap device hints. The runtime performance monitor refines it afterwards,
 * so this only needs to be a sensible starting point — no network-loaded GPU benchmarks.
 */
export function detectTier({
  coarsePointer,
  shortestScreenSide,
  cores,
  memoryGb,
  renderer,
}: DeviceHints): QualityTier {
  if (isSoftwareRenderer(renderer)) return 1;
  if (renderer && LOW_END_GPU.test(renderer)) return 1;

  const handheld = coarsePointer || shortestScreenSide < 600;
  if (handheld) return memoryGb >= 6 && cores >= 8 ? 2 : 1;
  if (cores >= 8 && memoryGb >= 8) return 3;
  return 2;
}

/**
 * `?tier=1|2|3` pins the quality tier and switches off runtime adaptation — for QA and for
 * capturing the full look on machines without a GPU (with `?webgl=force`).
 */
export function readForcedTier(search: string): QualityTier | null {
  const match = /[?&]tier=([123])(?:&|$)/.exec(search);
  return match ? (Number(match[1]) as QualityTier) : null;
}

export function readDeviceHints(renderer?: string): DeviceHints {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    shortestScreenSide: Math.min(window.screen.width, window.screen.height),
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory ?? 4,
    renderer,
  };
}

/** Unmasked renderer string via WEBGL_debug_renderer_info (absent in some browsers). */
export function readRenderer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): string | undefined {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  if (!info) return undefined;
  const value: unknown = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
  return typeof value === "string" ? value : undefined;
}
