"use client";

import { cx } from "@/lib/utils/cx";
import { useUiStore } from "@/stores/ui-store";

/** In-site reduced-motion switch for visitors who haven't set the OS preference. */
export function MotionToggle({ className }: { className?: string }) {
  const reduce = useUiStore((state) => state.motionPreference === "reduce");
  const setMotionPreference = useUiStore((state) => state.setMotionPreference);

  return (
    <button
      type="button"
      aria-pressed={reduce}
      onClick={() => {
        setMotionPreference(reduce ? "system" : "reduce");
      }}
      className={cx(
        "inline-flex items-center gap-2 label text-ash-400 transition-colors hover:text-bone",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "inline-block size-2 rounded-full border border-current transition-colors",
          reduce && "bg-accent",
        )}
      />
      Reduce motion
    </button>
  );
}
