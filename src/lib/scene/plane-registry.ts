import type { CoverMotif } from "@/content/home";

/** Motif → index of the procedural cover painted in `webgl/shaders/project.ts`. */
export const COVER_MOTIF_INDEX: Record<CoverMotif, number> = {
  eclipse: 0,
  cleaver: 1,
  gate: 2,
  mask: 3,
};

/**
 * DOM elements the WebGL stage draws over: each registered plane is rendered exactly where its
 * element is, every frame (the stage sits behind the DOM, so the element itself goes
 * transparent once WebGL is ready). The DOM side writes `hover`/`pointer`/`origin`; the scene
 * reads them — mutable state, never React state.
 */
export interface TrackedPlane {
  /** Stable identity (React key in the scene). */
  id: number;
  element: HTMLElement;
  /** Which procedural cover to paint (see `shaders/project.ts`). */
  motif: number;
  /** 0…1, varies the art between planes. */
  seed: number;
  /** 0…1, how far the hover burn has spread. */
  hover: number;
  /** Pointer over the plane, in its UV space (0…1, y up). */
  pointer: { x: number; y: number };
  /** Where the current burn started, in UV space. */
  origin: { x: number; y: number };
}

/** Upper bound of planes drawn at once. */
export const MAX_PLANES = 6;

type Listener = () => void;

let planes: readonly TrackedPlane[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

/** Adds a plane (ignored past MAX_PLANES) and returns its removal. */
export function registerPlane(plane: TrackedPlane): () => void {
  if (planes.length >= MAX_PLANES || planes.includes(plane)) return () => undefined;
  planes = [...planes, plane];
  emit();
  return () => {
    if (!planes.includes(plane)) return;
    planes = planes.filter((entry) => entry !== plane);
    emit();
  };
}

/** The current planes — a new array whenever the set changes (for useSyncExternalStore). */
export function getPlanes(): readonly TrackedPlane[] {
  return planes;
}

export function subscribePlanes(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let nextId = 0;

export function createPlane(element: HTMLElement, motif: number, seed: number): TrackedPlane {
  return {
    id: nextId++,
    element,
    motif,
    seed,
    hover: 0,
    pointer: { x: 0.5, y: 0.5 },
    origin: { x: 0.5, y: 0.5 },
  };
}
