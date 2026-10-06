import type { EclipseAnchor } from "@/lib/scene/scene-signal";
import { clamp, lerp, smoothstep } from "@/lib/utils/math";

/**
 * Sky composition — where the eclipse, spire and atmosphere sit for a given scroll position.
 *
 * Coordinates are "sky space": origin at the viewport centre, y up, 1 unit = viewport height
 * (so x spans ±aspect/2). This matches the sky fragment shader.
 */
export interface SkyComposition {
  eclipseX: number;
  eclipseY: number;
  eclipseRadius: number;
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
}

/** Converts a viewport point (CSS px, y down) into sky space. */
export function toSky(x: number, y: number, width: number, height: number) {
  return { x: (x - width / 2) / height, y: 0.5 - y / height };
}

/** Resting spot (top-right, small) used once the hero has scrolled away and on other pages. */
function restingEclipse(aspect: number) {
  const portrait = aspect < 0.8;
  return portrait
    ? { x: 0.25 * aspect, y: 0.36, radius: 0.07 }
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

/** Height of the spire in its local units (see the shader's spire SDF). */
export const SPIRE_HEIGHT = 1;

export function computeComposition({
  width,
  height,
  scroll,
  docHeight,
  anchor,
}: CompositionInput): SkyComposition {
  const aspect = width / height;
  const rest = restingEclipse(aspect);

  if (!anchor) {
    return {
      eclipseX: rest.x,
      eclipseY: rest.y,
      eclipseRadius: rest.radius,
      spireX: 0,
      spireBaseY: -0.5,
      spireScale: 0.5,
      spireVisibility: 0,
      beam: 0,
      clouds: 0.6,
      corona: 0.8,
    };
  }

  // Hero progress (first viewport) and whole-page progress.
  const heroProgress = clamp(scroll / height);
  const pageProgress = clamp(scroll / Math.max(docHeight - height, 1));

  // The eclipse lives far away: it trails the content at a third of the scroll speed.
  const hero = toSky(anchor.docX, anchor.docY - scroll * 0.35, width, height);
  const heroRadius = anchor.radius / height;

  const toRest = easeInOut(heroProgress);
  let x = lerp(hero.x, rest.x, toRest);
  let y = lerp(hero.y, rest.y, toRest);
  let radius = lerp(heroRadius, rest.radius, toRest);

  const finale = finaleEclipse(aspect);
  const toFinale = easeInOut(smoothstep(0.82, 1, pageProgress));
  x = lerp(x, finale.x, toFinale);
  y = lerp(y, finale.y, toFinale);
  radius = lerp(radius, finale.radius, toFinale);

  // The spire stands under the hero eclipse, its tip just below the ring, and sinks on scroll.
  const restingHero = toSky(anchor.docX, anchor.docY, width, height);
  const tipY = restingHero.y - heroRadius * 1.08;
  const spireScale = clamp((tipY + 0.5) / SPIRE_HEIGHT, 0.2, 1.1);

  return {
    eclipseX: x,
    eclipseY: y,
    eclipseRadius: radius,
    spireX: restingHero.x,
    spireBaseY: -0.5 - heroProgress * 0.55,
    spireScale,
    spireVisibility: 1 - smoothstep(0.45, 0.95, heroProgress),
    beam: 1 - smoothstep(0, 0.55, heroProgress),
    clouds: lerp(lerp(1, 0.55, easeInOut(heroProgress)), 0.4, toFinale),
    corona: lerp(1, 0.75, easeInOut(heroProgress)),
  };
}
