"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@/lib/motion/gsap";
import { useUiStore } from "@/stores/ui-store";

/**
 * The descent: every element with `data-realm` becomes a waypoint. Whichever section crosses the
 * viewport's centre line sets the realm target; the realm bridge eases the site toward it.
 * Mount once per page that has realm waypoints.
 */
export function DescentController() {
  useEffect(() => {
    const { setSectionRealm } = useUiStore.getState();
    const waypoints = document.querySelectorAll<HTMLElement>("[data-realm]");

    const triggers = Array.from(waypoints, (element) => {
      const realm = Number(element.dataset.realm);
      return ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setSectionRealm(realm);
        },
      });
    });

    return () => {
      for (const trigger of triggers) trigger.kill();
      setSectionRealm(0);
    };
  }, []);

  return null;
}
