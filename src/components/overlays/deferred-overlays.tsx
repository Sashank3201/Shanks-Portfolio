"use client";

import dynamic from "next/dynamic";

/**
 * Overlays that are never part of the first paint load after hydration, off the critical path:
 * the back-to-top crescent, the route-transition overlay and the custom cursor.
 */
const ScrollProgress = dynamic(
  () => import("@/components/layout/scroll-progress").then((module) => module.ScrollProgress),
  { ssr: false },
);
const RouteTransition = dynamic(
  () => import("./route-transition").then((module) => module.RouteTransition),
  { ssr: false },
);
const Cursor = dynamic(() => import("./cursor").then((module) => module.Cursor), { ssr: false });

export function DeferredOverlays() {
  return (
    <>
      <ScrollProgress />
      <RouteTransition />
      <Cursor />
    </>
  );
}
