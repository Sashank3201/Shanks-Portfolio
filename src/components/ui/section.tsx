import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { KanjiIndex } from "./kanji-index";

export interface SectionProps {
  id: string;
  /** Formal numeral (壱 弐 参 肆 伍). */
  numeral: string;
  /** One-kanji label (魂 刃 道 技 門). */
  glyph: string;
  eyebrow: string;
  title: ReactNode;
  /** Realm target while this section is active: 0 Shinigami → 1 Hollow. */
  realm: number;
  children?: ReactNode;
  className?: string;
}

/**
 * A home-page chapter. `data-realm` is read by the descent choreography, which eases the site
 * toward this section's realm while it is in view.
 */
export function Section({
  id,
  numeral,
  glyph,
  eyebrow,
  title,
  realm,
  children,
  className,
}: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-realm={realm}
      className={cn("relative scroll-mt-(--header-height) py-28 md:py-40", className)}
    >
      <div className="container-site">
        <header className="mb-10 flex items-baseline gap-5 md:mb-16">
          <KanjiIndex numeral={numeral} glyph={glyph} />
          <span aria-hidden="true" className="h-px w-12 bg-ash-800" />
          <p className="label text-ash-400">{eyebrow}</p>
        </header>
        <h2 id={titleId} className="max-w-5xl font-display text-display-lg text-balance">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
