import { noiseChunk } from "./chunks/noise";
import { sdfChunk, spireChunk } from "./chunks/sdf";

/** Full-screen triangle: positions are already in clip space, the camera is ignored. */
export const skyVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * The sky: void gradient, domain-warped smoke lit by the eclipse, the eclipse itself (corona,
 * streamers, ring, limb and the occluding moon that swings round into a crescent as the realm
 * turns), the spire with its windows and outline, and the beam rising from its needle.
 *
 * Space: origin at the viewport centre, y up, 1 unit = viewport height (see composition.ts).
 */
export const skyFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAspect;
uniform float uRealm;
uniform vec3 uEclipse;      // centre.xy, radius
uniform float uEclipseReveal;
uniform vec4 uSpire;        // x, baseY, scale, visibility
uniform float uBeam;
uniform float uClouds;
uniform float uCorona;
uniform float uVignette;
uniform vec2 uPointer;

uniform vec3 uVoid;
uniform vec3 uBone;
uniform vec3 uSpirit;
uniform vec3 uReiatsu;
uniform vec3 uEmber;
uniform vec3 uMaroon;

varying vec2 vUv;

${noiseChunk}
${sdfChunk}
${spireChunk}

void main() {
  vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
  float aa = max(fwidth(p.y), 1e-4) * 1.25;
  float realm = clamp(uRealm, 0.0, 1.0);
  float t = uTime;

  vec2 c = uEclipse.xy + uPointer * 0.006;
  float R = max(uEclipse.z, 1e-3);
  vec2 d = p - c;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float reveal = clamp(uEclipseReveal, 0.0, 1.0);

  vec3 rimColor = mix(uBone, uReiatsu, realm);
  vec3 glowColor = mix(uBone, uEmber, realm);
  vec3 lightColor = mix(uSpirit, uReiatsu, realm);

  // Background: the void, a faint lift around the eclipse, a blood haze rising in the Hollow.
  vec3 col = uVoid;
  col += mix(uSpirit * 0.03, uMaroon * 0.5, realm) * exp(-r * 2.0) * reveal;
  col += uMaroon * realm * 0.4 * smoothstep(0.15, -0.65, p.y);

  // Smoke: two layers of domain-warped fbm drifting past, lit by the eclipse.
  vec2 q = p * 1.3 + uPointer * 0.025;
  float drift = t * 0.011;
  float warp = fbm(vec3(q * 1.15 + vec2(drift, -drift * 0.4), t * 0.013));
  float n = fbm(vec3(q * 2.4 + vec2(warp * 1.5 - drift, warp * 0.6), t * 0.019 + 3.1));
  float density = smoothstep(-0.08, 0.6, n + warp * 0.35) * uClouds * mix(1.0, 0.6, realm);
  float lit = exp(-max(r - R, 0.0) * 6.0) * reveal;
  vec3 smoke = mix(vec3(0.01, 0.01, 0.016), glowColor * 0.32, lit);
  col = mix(col, smoke, density * 0.92);

  // Corona: a soft halo plus fine radial streamers, thinning as the realm turns.
  vec2 dir = d / max(r, 1e-4);
  float streak = fbm(vec3(dir * 2.3, t * 0.025 + r * 1.2));
  float outside = max(r - R, 0.0);
  float halo = exp(-outside / (R * 0.2 + 0.02)) * (0.55 + 0.45 * (streak * 0.5 + 0.5));
  float rays = pow(max(0.0, 0.5 + 0.5 * sin(ang * 38.0 + streak * 7.0)), 8.0);
  float corona = halo * 0.8 + rays * exp(-outside / (R * 0.6 + 0.03)) * 0.28;
  corona *= smoothstep(R * 0.97, R * 1.02, r) * uCorona * mix(1.0, 0.4, realm);
  // Smoke drifting in front of the corona dims it (the streaks seen across the ring).
  corona *= 1.0 - density * 0.55;

  // The disc's bright limb, the ring, and the moon swinging from annulus to crescent.
  vec2 moonOffset = mix(vec2(0.07, 0.05), vec2(-0.22, 0.12), smoothstep(0.15, 1.0, realm)) * R;
  float moonRadius = R * mix(0.965, 0.95, realm);
  float moon = 1.0 - smoothstep(moonRadius - aa, moonRadius + aa, length(p - (c + moonOffset)));
  float disc = 1.0 - smoothstep(R - aa, R + aa, r);
  float ring = exp(-pow((r - R) / max(R * 0.014, aa), 2.0));
  float limb = disc * (1.0 - moon);

  vec3 eclipse = rimColor * (ring * 1.2 + limb * 1.6) + glowColor * corona;
  col += eclipse * reveal;
  col = mix(col, uVoid * 0.5, moon * reveal);

  // The spire, its beam, windows and (in the Hollow) a glowing outline.
  float spireVisibility = clamp(uSpire.w, 0.0, 1.0);
  if (spireVisibility > 0.001) {
    float scale = max(uSpire.z, 1e-3);
    vec2 base = vec2(uSpire.x + uPointer.x * 0.004, uSpire.y);
    vec2 local = (p - base) / scale;
    float keep;
    float sd = spireSDF(local, keep) * scale;

    // Beam: from the needle up into the eclipse, widening and shimmering.
    vec2 apex = base + vec2(0.0, scale);
    float span = max(c.y - apex.y, 1e-3);
    float h = (p.y - apex.y) / span;
    float width = mix(0.0035, 0.022, clamp(h, 0.0, 1.0));
    float beam = exp(-pow((p.x - apex.x) / width, 2.0));
    beam *= smoothstep(0.0, 0.04, h) * (1.0 - smoothstep(0.8, 1.0, h));
    beam *= 0.75 + 0.25 * snoise(vec3(p.y * 26.0 - t * 1.6, p.x * 40.0, t * 0.5));
    beam *= 1.0 - disc;
    float flare = exp(-length(p - apex) / (0.012 * scale + 0.004));
    col += lightColor * (beam * 1.2 + flare * 1.6) * uBeam * spireVisibility * reveal;

    // Body: dark stone washed with light from above.
    float inside = 1.0 - smoothstep(-aa, aa, sd);
    float wash = smoothstep(0.0, 1.0, local.y) * (1.0 - realm * 0.8);
    float masonry = 0.92 + 0.08 * sin(local.x * 140.0);
    vec3 stone = mix(vec3(0.03, 0.03, 0.048), vec3(0.025, 0.006, 0.01), realm);
    stone += uSpirit * 0.15 * wash * wash * masonry;

    // Windows: narrow lit slits in the keep, flickering.
    vec2 cell = local * vec2(26.0, 15.0);
    float slit = step(abs(fract(cell.x) - 0.5), 0.12) * step(fract(cell.y), 0.6);
    float flicker = 0.65 + 0.35 * snoise(vec3(floor(cell), t * 0.35));
    float windows = slit * (1.0 - smoothstep(-0.01, 0.0, keep)) * flicker;
    stone += lightColor * windows * 0.75;

    col = mix(col, stone, inside * spireVisibility);

    // Hollow outline (the red-outline frames).
    float edge = 1.0 - smoothstep(0.0, aa * 2.0, abs(sd));
    col += uReiatsu * edge * realm * 1.4 * spireVisibility;
  }

  // Vignette (used when post-processing is off).
  float vig = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(1.0, 1.15)) * 1.5);
  col *= mix(1.0, vig, uVignette);

  // Dither to kill banding in the deep gradients.
  col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <colorspace_fragment>
}
`;
