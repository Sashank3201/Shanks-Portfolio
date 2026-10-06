"use client";

import { MaskGlyph } from "@/components/illustrations/mask-glyph";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/ui-store";

/**
 * Release: forces the Hollow realm site-wide. A toggle button (aria-pressed) whose accessible
 * name stays constant, as the pattern requires.
 */
export function RealmToggle({ className }: { className?: string }) {
  const release = useUiStore((state) => state.release);
  const toggleRelease = useUiStore((state) => state.toggleRelease);

  return (
    <button
      type="button"
      aria-pressed={release}
      onClick={toggleRelease}
      className={cn(
        "group/release inline-flex h-10 items-center gap-2.5 rounded-full border px-4 label",
        "transition-[color,border-color,background-color,box-shadow] duration-500 ease-reiatsu",
        release
          ? "border-reiatsu/70 bg-maroon/60 text-bone shadow-[0_0_24px_-6px_var(--color-reiatsu)]"
          : "border-ash-800 text-ash-200 hover:border-ash-400 hover:text-bone",
        className,
      )}
    >
      <MaskGlyph
        className={cn(
          "size-4 transition-[color,transform] duration-500 ease-reiatsu",
          release ? "scale-110 text-reiatsu" : "text-ash-400 group-hover/release:text-bone",
        )}
      />
      <span>Release</span>
    </button>
  );
}
