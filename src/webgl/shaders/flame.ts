import { noiseChunk } from "./chunks/noise";

/**
 * Reiatsu flames: one instanced quad per `[data-flame-anchor]`, placed in document space (CSS px)
 * and scrolled with the page. Each quad spans the flame's own space — x ∈ [-FLAME_HALF_WIDTH,
 * FLAME_HALF_WIDTH], y ∈ [FLAME_BOTTOM, FLAME_TOP], anchor at 0 — in units of the anchor's radius
 * times `uScale`. The stage sits behind the DOM, so the flames must outgrow the silhouette that
 * owns the anchor to lick out around it.
 */
const FLAME_HALF_WIDTH = "1.9";
const FLAME_BOTTOM = "-1.3";
const FLAME_TOP = "4.6";

export const flameVertexShader = /* glsl */ `
attribute vec4 aFlame; // document x, document y, radius (CSS px), seed

uniform vec2 uViewport; // CSS px
uniform float uScroll;  // CSS px
uniform float uScale;   // flame-space unit, in anchor radii

varying vec2 vFlame;
varying float vSeed;

void main() {
  vec2 corner = position.xy * 0.5 + 0.5;
  vec2 local = vec2(
    mix(-${FLAME_HALF_WIDTH}, ${FLAME_HALF_WIDTH}, corner.x),
    mix(${FLAME_BOTTOM}, ${FLAME_TOP}, corner.y)
  );
  // Screen space grows downward; flame space grows upward.
  vec2 screen = aFlame.xy + vec2(local.x, -local.y) * aFlame.z * uScale - vec2(0.0, uScroll);
  gl_Position = vec4(screen.x / uViewport.x * 2.0 - 1.0, 1.0 - screen.y / uViewport.y * 2.0, 0.0, 1.0);

  vFlame = local;
  vSeed = aFlame.w;
}
`;

export const flameFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uDeep;
uniform vec3 uFlame;
uniform vec3 uCore;

varying vec2 vFlame;
varying float vSeed;

${noiseChunk}

void main() {
  vec2 p = vFlame;
  float t = uTime + vSeed * 31.0;
  float h = clamp(p.y / ${FLAME_TOP}, 0.0, 1.0);

  // Tongues sway more the higher they rise, and the sway travels upward.
  float sway = snoise(vec3(p.y * 0.45 - t * 0.9, vSeed * 7.0, t * 0.2)) * 0.75
    + snoise(vec3(p.y * 1.3 - t * 1.7, vSeed * 3.0 + 5.0, t * 0.35)) * 0.25;
  float x = p.x - sway * smoothstep(-0.2, 3.0, p.y) * 0.85;

  // Teardrop envelope: a rounded base around the anchor narrowing to a ragged tip.
  float width = mix(1.15, 0.12, pow(h, 0.7));
  float envelope = 1.0 - smoothstep(0.35, 1.0, abs(x) / width);
  envelope *= smoothstep(${FLAME_BOTTOM}, -0.35, p.y);

  // Rising turbulence carves the body into tongues that tear off as they climb.
  float n = fbm(vec3(x * 1.35, p.y * 0.85 - t * 1.9, t * 0.45 + vSeed * 4.0)) * 0.5 + 0.5;
  float fire = envelope * smoothstep(0.32 + h * 0.5, 0.5 + h * 0.42, n + (1.0 - h) * 0.32);

  // A hot core hugs the anchor itself, and the spine of each tongue burns hotter than its edge.
  float core = exp(-dot(p * vec2(1.25, 0.95), p * vec2(1.25, 0.95)) * 1.6);
  float spine = 1.0 - smoothstep(0.0, width * 0.7, abs(x));
  float heat = clamp(fire * (0.75 + spine * 0.45) * (1.05 - h * 0.8) + core * 0.55, 0.0, 1.0);

  vec3 color = mix(uDeep, uFlame, smoothstep(0.05, 0.45, heat));
  color = mix(color, uCore, smoothstep(0.6, 1.0, heat));
  float alpha = clamp(fire * 0.9 + core * 0.4, 0.0, 1.0) * uIntensity;

  // Additive blending (SrcAlpha, One): emit straight colour, alpha scales the contribution.
  gl_FragColor = vec4(color * 1.6, alpha);
  #include <colorspace_fragment>
}
`;
