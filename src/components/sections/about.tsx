import { HornedMask } from "@/components/illustrations/horned-mask";
import { DrawOnScroll } from "@/components/motion/draw-on-scroll";
import { ScrambleText } from "@/components/motion/scramble-text";
import { ScrollWords } from "@/components/motion/scroll-words";
import { Section } from "@/components/ui/section";
import { about } from "@/content/home";

/**
 * 壱 About — a split: the bio lights up in large type, word by word, while the horned mask stays
 * pinned beside it (sticky) and draws itself with the scroll. The stats decode from katakana.
 */
export function About() {
  return (
    <Section
      id="about"
      numeral="壱"
      glyph="魂"
      eyebrow="About"
      title="A soul split between precision and spectacle."
      realm={0.15}
      glyphSide="right"
    >
      <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-12 md:gap-10">
        <div className="md:order-2 md:col-span-5">
          <div className="md:sticky md:top-[18vh]">
            <DrawOnScroll
              scrub
              trigger="section"
              start="top 70%"
              end="bottom 85%"
              className="mx-auto w-full max-w-xs text-rim md:max-w-md"
            >
              <HornedMask className="w-full drop-shadow-[0_0_22px_var(--color-glow)]" />
            </DrawOnScroll>
          </div>
        </div>
        <div className="space-y-20 md:order-1 md:col-span-7 md:min-h-[120vh] md:pt-[8vh]">
          <ScrollWords className="font-display text-display-md leading-[1.12] text-bone">
            {about.bio}
          </ScrollWords>
          <dl className="flex flex-wrap gap-x-16 gap-y-10 border-t border-ash-900 pt-10">
            {about.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-3">
                <dt className="label text-ash-400">{stat.label}</dt>
                <dd className="font-display text-display-lg leading-none text-accent">
                  <ScrambleText text={stat.value} duration={1.4} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
