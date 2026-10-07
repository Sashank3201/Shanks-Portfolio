import { noiseChunk } from "./chunks/noise";

/**
 * A project cover, painted procedurally where its DOM box is (uRect, CSS px). The plane bows
 * sideways with scroll velocity (uBend) like a banner.
 */
export const projectVertexShader = /* glsl */ `
uniform vec4 uRect;     // left, top, width, height (CSS px, viewport)
uniform vec2 uViewport; // CSS px
uniform float uBend;    // px

varying vec2 vUv;

void main() {
  vec2 uv = position.xy + 0.5;
  vec2 px = vec2(uRect.x + uv.x * uRect.z, uRect.y + (1.0 - uv.y) * uRect.w);
  px.x += sin(uv.y * 3.14159265) * uBend;
  gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, 0.0, 1.0);
  vUv = uv;
}
`;

/**
 * Each cover is a small scene in the house style: a motif silhouette (eclipse, cleaver, gate or
 * horned mask with burning eye slits) with a rim light and backlit halo, drifting smoke and
 * grain. Hovering burns a crimson Hollow version through from where the pointer entered, behind
 * an ember front; the rim splits into colour fringes as it burns or as the page moves fast.
 *
 * Space: cover space, height 1, centred (x spans ±aspect/2). Motif indices: COVER_MOTIF_INDEX
 * in `lib/scene/plane-registry.ts`.
 */
export const projectFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uMotif;
uniform float uSeed;
uniform float uHover;
uniform vec2 uPointer;
uniform vec2 uOrigin;
uniform float uRealm;
uniform float uAspect;
uniform float uRadius;
uniform float uSplit;

uniform vec3 uVoid;
uniform vec3 uBone;
uniform vec3 uSpirit;
uniform vec3 uSpiritDeep;
uniform vec3 uReiatsu;
uniform vec3 uEmber;
uniform vec3 uMaroon;

varying vec2 vUv;

${noiseChunk}

float sdCircle(vec2 p, float r) { return length(p) - r; }

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float eclipseSDF(vec2 p) {
  return sdCircle(p - vec2(0.0, 0.03), 0.25);
}

float cleaverSDF(vec2 p) {
  vec2 q = rot(-0.42) * (p - vec2(0.02, -0.01));
  float blade = sdBox(q - vec2(0.0, -0.06), vec2(0.07, 0.33));
  blade = max(blade, dot(q - vec2(0.07, -0.33), normalize(vec2(1.0, -0.9))));
  float guard = sdBox(q - vec2(-0.005, 0.28), vec2(0.095, 0.011));
  float grip = sdBox(q - vec2(-0.025, 0.37), vec2(0.02, 0.08));
  return min(blade, min(guard, grip));
}

float gateSDF(vec2 p) {
  vec2 m = vec2(abs(p.x), p.y);
  float posts = sdBox(m - vec2(0.24, -0.1), vec2(0.02, 0.36));
  vec2 k = p - vec2(0.0, 0.3);
  k.y -= 0.55 * k.x * k.x;
  float kasagi = sdBox(k, vec2(0.42, 0.022));
  float nuki = sdBox(p - vec2(0.0, 0.19), vec2(0.32, 0.013));
  float strut = sdBox(p - vec2(0.0, 0.24), vec2(0.012, 0.045));
  return min(min(posts, kasagi), min(nuki, strut));
}

float maskSDF(vec2 p) {
  vec2 q = p - vec2(0.0, -0.05);
  vec2 m = vec2(abs(q.x), q.y);
  float face = (length(q / vec2(0.19, 0.25)) - 1.0) * 0.19;
  float horn = max(sdCircle(m - vec2(0.25, 0.12), 0.2), -sdCircle(m - vec2(0.31, 0.2), 0.205));
  horn = max(horn, 0.04 - m.y);
  float eye = sdBox(rot(0.38) * (m - vec2(0.085, 0.03)), vec2(0.05, 0.011));
  float mouth = sdBox(q - vec2(0.0, -0.13), vec2(0.07, 0.005));
  return max(min(face, horn), -min(eye, mouth));
}

float motifSDF(vec2 p) {
  if (uMotif < 0.5) return eclipseSDF(p);
  if (uMotif < 1.5) return cleaverSDF(p);
  if (uMotif < 2.5) return gateSDF(p);
  return maskSDF(p);
}

vec3 paint(vec2 p, float sd, float hollow, float t) {
  vec3 rim = mix(mix(uBone, uSpirit, 0.3), uReiatsu, hollow);
  vec3 glow = mix(uSpirit, uEmber, hollow);
  vec3 deep = mix(uSpiritDeep * 0.4, uMaroon * 1.4, hollow);

  vec3 col = mix(uVoid, deep, smoothstep(0.55, -0.6, p.y) * 0.85);
  float smoke = fbm(vec3(p * 2.1 + vec2(t * 0.035, -t * 0.02) + uSeed * 9.0, t * 0.05 + uSeed * 3.0));
  col += glow * 0.1 * smoothstep(-0.15, 0.75, smoke);

  float outside = max(sd, 0.0);
  float halo = exp(-outside * 8.0) * (0.75 + 0.25 * smoke);
  col += glow * halo * 0.42;

  float inside = 1.0 - smoothstep(-0.0015, 0.0015, sd);
  col = mix(col, uVoid * 0.35, inside);
  col += rim * exp(-abs(sd) * 150.0) * 1.15;
  return col;
}

void main() {
  float t = uTime + uSeed * 40.0;
  vec2 frame = vec2(uAspect, 1.0);
  vec2 p = (vUv - 0.5) * frame;
  p *= 1.0 - 0.05 * uHover;
  p -= (uPointer - 0.5) * frame * 0.03 * uHover;

  float sd = motifSDF(p);
  float baseHollow = clamp(uRealm * 0.7, 0.0, 1.0);
  vec3 col = paint(p, sd, baseHollow, t);

  // The burn: a noisy front spreading from where the pointer came in.
  float spread = length((vUv - uOrigin) * frame);
  float ragged = fbm(vec3(vUv * frame * 3.2, uSeed * 5.0 + t * 0.08)) * 0.16;
  float front = uHover * (length(frame) + 0.3);
  float reach = spread + ragged;
  if (uHover > 0.001) {
    float burned = 1.0 - smoothstep(front - 0.045, front, reach);
    col = mix(col, paint(p, sd, 1.0, t), burned);
    float ember = smoothstep(front - 0.08, front - 0.015, reach) * (1.0 - smoothstep(front - 0.015, front + 0.01, reach));
    col += uEmber * ember * 2.6;
  }

  // Colour fringes on the rim.
  vec3 rim = mix(uBone, uReiatsu, max(baseHollow, uHover));
  col.r += rim.r * exp(-abs(motifSDF(p + vec2(uSplit, 0.0))) * 150.0) * 0.55;
  col.b += rim.b * exp(-abs(motifSDF(p - vec2(uSplit, 0.0))) * 150.0) * 0.55;

  // Inner vignette, grain, rounded corners.
  col *= mix(0.55, 1.0, smoothstep(0.95, 0.2, length((vUv - 0.5) * vec2(1.0, 1.25))));
  col += (hash12(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.035;
  float alpha = 1.0 - smoothstep(-0.002, 0.0015, sdBox((vUv - 0.5) * frame, frame * 0.5 - uRadius) - uRadius);

  gl_FragColor = vec4(max(col, 0.0), alpha);
  #include <colorspace_fragment>
}
`;
