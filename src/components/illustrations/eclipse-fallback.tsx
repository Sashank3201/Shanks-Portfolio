import { cn } from "@/lib/utils/cn";

/**
 * CSS-only eclipse: corona glow, bright ring and the occluding moon that carves the crescent.
 * Paints instantly (no JS), so it is the first frame of the hero and the permanent fallback when
 * WebGL is unavailable. Realm-aware through the accent/glow tokens.
 */
export function EclipseFallback({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative aspect-square", className)}>
      <div className="absolute -inset-[45%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-glow)_16%,transparent),transparent_75%)]" />
      <div className="absolute -inset-[18%] rounded-full bg-[repeating-conic-gradient(from_8deg,color-mix(in_oklch,var(--color-glow)_10%,transparent)_0deg_1.2deg,transparent_1.2deg_9deg)] [mask-image:radial-gradient(closest-side,transparent_62%,black_70%,transparent)]" />
      <div className="absolute inset-0 rounded-full border border-rim/80 shadow-[0_0_48px_6px_color-mix(in_oklch,var(--color-glow)_45%,transparent),inset_0_0_36px_2px_color-mix(in_oklch,var(--color-glow)_35%,transparent)]" />
      <div className="absolute inset-[2.5%] translate-x-[7%] -translate-y-[5%] rounded-full bg-void shadow-[0_0_24px_4px_var(--color-void)]" />
    </div>
  );
}
