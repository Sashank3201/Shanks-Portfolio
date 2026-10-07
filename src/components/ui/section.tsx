import type { ReactNode } from "react";

import { SplitReveal } from "@/components/motion/split-reveal";
import { cn } from "@/lib/utils/cn";

import { ChapterGlyph } from "./chapter-glyph";
import { KanjiIndex } from "./kanji-index";

const TITLE_CLASS = "max-w-5xl font-display text-display-lg text-balance";

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
  /** Which side the chapter's giant outlined kanji sits on. */
  glyphSide?: "left" | "right";
  children?: ReactNode;
  className?: string;
}

/**
 * A home-page chapter, opened like an anime title card: its kanji enormous and outlined behind
 * the title. `data-realm` is read by the descent choreography, which eases the site toward this
 * section's realm while it is in view.
 */
export function Section({
  id,
  numeral,
  glyph,
  eyebrow,
  title,
  realm,
  glyphSide = "right",
  children,
  className,
}: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-realm={realm}
      className={cn(
        "relative isolate scroll-mt-(--header-height) overflow-x-clip py-28 md:py-40",
        className,
      )}
    >
      <ChapterGlyph glyph={glyph} side={glyphSide} />
      <div className="container-site">
        <header className="mb-10 flex items-baseline gap-5 md:mb-16">
          <KanjiIndex numeral={numeral} glyph={glyph} />
          <span aria-hidden="true" className="h-px w-12 bg-ash-800" />
          <p className="label text-ash-400">{eyebrow}</p>
        </header>
        {typeof title === "string" ? (
          <SplitReveal as="h2" id={titleId} className={TITLE_CLASS}>
            {title}
          </SplitReveal>
        ) : (
          <h2 id={titleId} className={TITLE_CLASS}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
