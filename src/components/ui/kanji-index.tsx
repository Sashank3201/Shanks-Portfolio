import { cn } from "@/lib/utils/cn";

interface KanjiIndexProps {
  /** Formal numeral, e.g. 壱. */
  numeral: string;
  /** One-kanji section label, e.g. 魂. */
  glyph: string;
  className?: string;
}

/**
 * Decorative section index (numeral + kanji). Hidden from assistive tech: every section also has
 * an English heading, so the glyphs add mood without adding noise.
 */
export function KanjiIndex({ numeral, glyph, className }: KanjiIndexProps) {
  return (
    <span
      lang="ja"
      aria-hidden="true"
      className={cn("inline-flex items-baseline gap-3 font-jp select-none", className)}
    >
      <span className="text-2xl text-accent">{numeral}</span>
      <span className="text-sm text-ash-400">{glyph}</span>
    </span>
  );
}
