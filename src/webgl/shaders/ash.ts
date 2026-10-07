/**
 * Ash and embers: screen-space point sprites. Each particle owns a seed (x, y, depth); position
 * is integrated from a CPU-accumulated flow so the direction can reverse smoothly — ash drifts
 * down in the Shinigami realm, embers rise in the Hollow.
 */
export const ashVertexShader = /* glsl */ `
attribute vec3 aSeed;

uniform float uTime;
uniform float uFlow;
uniform float uScroll;
uniform float uRealm;
uniform float uPixelRatio;
uniform float uSize;

varying float vAlpha;
varying float vDepth;

void main() {
  float depth = aSeed.z;
  float speed = mix(0.012, 0.055, depth);
  float sway = sin(uTime * (0.12 + aSeed.y * 0.25) + aSeed.z * 40.0) * 0.012 * (1.0 + depth);

  vec2 position2 = vec2(
    aSeed.x + sway,
    aSeed.y + uFlow * speed + uScroll * mix(0.03, 0.16, depth)
  );
  vec2 clip = fract(position2) * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);

  gl_PointSize = uSize * mix(0.8, 3.4, depth * depth) * uPixelRatio * mix(1.0, 1.35, uRealm);

  float twinkle = 0.55 + 0.45 * sin(uTime * (1.4 + aSeed.x * 3.0) + aSeed.y * 40.0);
  vAlpha = mix(0.22, 0.85, depth) * mix(0.7, twinkle, uRealm);
  vDepth = depth;
}
`;

export const ashFragmentShader = /* glsl */ `
uniform float uRealm;
uniform vec3 uAsh;
uniform vec3 uEmber;
uniform vec3 uReiatsu;

varying float vAlpha;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = smoothstep(0.5, 0.0, d);
  vec3 ember = mix(uReiatsu, uEmber, vDepth) * 2.2;
  vec3 color = mix(uAsh * 0.55, ember, uRealm);
  // Additive blending (SrcAlpha, One): emit straight colour, alpha scales the contribution.
  gl_FragColor = vec4(color, soft * vAlpha);
  #include <colorspace_fragment>
}
`;
