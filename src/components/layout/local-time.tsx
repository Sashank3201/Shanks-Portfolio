"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 15_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, TICK_MS);
  return () => {
    window.clearInterval(id);
  };
}

/**
 * The owner's local time. Rendered only on the client (the static HTML carries a placeholder),
 * through useSyncExternalStore so there is no hydration mismatch and no setState-in-effect.
 */
export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const time = useSyncExternalStore(
    subscribe,
    () => formatter.format(Date.now()),
    () => null,
  );

  return (
    <time className={className} dateTime={time ?? undefined} suppressHydrationWarning>
      {time ?? "--:--"}
    </time>
  );
}
