import type { EclipseAnchor } from "@/lib/scene/scene-signal";
import { clamp, lerp, smoothstep } from "@/lib/utils/math";

/**
 * Sky composition — where the eclipse, spire and atmosphere sit for a given moment.
 *
 * Coordinates are "sky space": origin at the viewport centre, y up, 1 unit = viewport height
 * (so x spans ±aspect/2). This matches the sky fragment shader.
 *
 * On the home page the hero pins while the camera dives into the eclipse (`dive` 0→1): the disc
 * grows past the screen until the moon swallows the view. Once the page moves on (`emerge` 0→1)
 * the eclipse re-emerges, small, at its resting spot — and grows into the finale crescent near
 * the bottom of the page.
 */
export interface SkyComposition {
  eclipseX: number;
  eclipseY: number;
  eclipseRadius: number;
  /** 0…1 visibility of the whole eclipse (it fades back in after the dive). */
  eclipseVisibility: number;
  spireX: number;
  spireBaseY: number;
  spireScale: number;
  spireVisibility: number;
  beam: number;
  clouds: number;
  corona: number;
}

export interface CompositionInput {
  width: number;
  height: number;
  scroll: number;
  docHeight: number;
  anchor: EclipseAnchor | null;
  /** 0…1 progress of the hero's pinned dive into the eclipse. */
  dive?: number;
  /** 0…1 progress of the eclipse re-emerging at rest once the hero has gone. */
  emerge?: number;
}

/** Converts a viewport point (CSS px, y down) into sky space. */
export function toSky(x: number, y: number, width: number, height: number) {
  return { x: (x - width / 2) / height, y: 0.5 - y / height };
}

/** Resting spot (top-right, small) used once the hero has gone and on other pages. */
function restingEclipse(aspect: number) {
  const portrait = aspect < 0.8;
  // Portrait screens tuck it into the top corner, small, so it never sits behind the copy.
  return portrait
    ? { x: 0.3 * aspect, y: 0.39, radius: 0.045 }
    : { x: 0.3 * aspect, y: 0.3, radius: 0.085 };
}

/** The Contact composition: a larger crescent, upper right (the red crescent frame). */
function finaleEclipse(aspect: number) {
  const portrait = aspect < 0.8;
  return portrait
    ? { x: 0.12 * aspect, y: 0.3, radius: 0.12 }
    : { x: 0.2 * aspect, y: 0.24, radius: 0.15 };
}

const easeInOut = (t: number) => smoothstep(0, 1, t);

/**
 * The eclipse re-emerges only once the dive has truly finished — while the moon fills the screen
 * — so a lagging scrub can never pop the resting eclipse in early.
 */
export function hasEmerged(dive: number, emerge: number): boolean {
  return emerge > 0 && dive >= 0.98;
}

/** Height of the spire in its local units (see the shader's spire SDF). */
export const SPIRE_HEIGHT = 1;

/**
 * Radius at which the moon covers the whole viewport, ring and limb beyond its edges. The
 * shader centres the moon as the dive completes, so its own radius (≥ 0.95 R) is what counts.
 */
export function coverRadius(aspect: number): number {
  return 0.5 * Math.hypot(aspect, 1) * 1.35;
}

export function computeComposition({
  width,
  height,
  scroll,
  docHeight,
  anchor,
  dive: rawDive = 0,
  emerge: rawEmerge = 0,
}: CompositionInput): SkyComposition {
  const aspect = width / height;
  const rest = restingEclipse(aspect);

  if (!anchor) {
    return {
      eclipseX: rest.x,
      eclipseY: rest.y,
      eclipseRadius: rest.radius,
      eclipseVisibility: 1,
      spireX: 0,
      spireBaseY: -0.5,
      spireScale: 0.5,
      spireVisibility: 0,
      beam: 0,
      clouds: 0.6,
      corona: 0.8,
    };
  }

  const dive = clamp(rawDive);
  const emerge = clamp(rawEmerge);

  // The hero is pinned during the dive, so the anchor sits where the page first laid it out.
  const hero = toSky(anchor.docX, anchor.docY, width, height);
  const heroRadius = anchor.radius / height;

  // The spire stands under the hero eclipse, its tip just below the ring.
  const tipY = hero.y - heroRadius * 1.08;
  const spireScale = clamp((tipY + 0.5) / SPIRE_HEIGHT, 0.2, 1.1);

  if (!hasEmerged(dive, emerge)) {
    // The dive: an exponential zoom reads as a constant-speed fall into the disc.
    const zoom = easeInOut(dive);
    const centre = easeInOut(smoothstep(0, 0.85, dive));
    return {
      eclipseX: lerp(hero.x, 0, centre),
      eclipseY: lerp(hero.y, 0, centre),
      eclipseRadius: heroRadius * Math.pow(coverRadius(aspect) / heroRadius, zoom),
      eclipseVisibility: 1,
      spireX: hero.x,
      spireBaseY: -0.5 - easeInOut(dive) * 0.45,
      spireScale,
      spireVisibility: 1 - smoothstep(0, 0.55, dive),
      beam: 1 - smoothstep(0, 0.4, dive),
      clouds: lerp(1, 0.35, dive),
      corona: 1,
    };
  }

  // Re-emerged: at rest, then growing into the finale crescent near the bottom of the page.
  const pageProgress = clamp(scroll / Math.max(docHeight - height, 1));
  const finale = finaleEclipse(aspect);
  const toFinale = easeInOut(smoothstep(0.82, 1, pageProgress));

  return {
    eclipseX: lerp(rest.x, finale.x, toFinale),
    eclipseY: lerp(rest.y, finale.y, toFinale),
    eclipseRadius: lerp(rest.radius, finale.radius, toFinale),
    eclipseVisibility: smoothstep(0.1, 1, emerge),
    spireX: hero.x,
    spireBaseY: -0.95,
    spireScale,
    spireVisibility: 0,
    beam: 0,
    clouds: lerp(0.55, 0.4, toFinale),
    corona: 0.75,
  };
}
