import { HornedMask } from "@/components/illustrations/horned-mask";
import { DrawOnScroll } from "@/components/motion/draw-on-scroll";
import { ScrollWords } from "@/components/motion/scroll-words";
import { Section } from "@/components/ui/section";
import { about } from "@/content/home";

/** 壱 About — the bio lights up word by word while the horned mask draws itself. */
export function About() {
  return (
    <Section
      id="about"
      numeral="壱"
      glyph="魂"
      eyebrow="About"
      title="A soul split between precision and spectacle."
      realm={0.15}
    >
      <div className="mt-16 grid items-center gap-16 md:mt-24 md:grid-cols-12">
        <div className="space-y-14 md:col-span-7">
          <ScrollWords className="max-w-2xl text-lead text-bone md:text-title">
            {about.bio}
          </ScrollWords>
          <dl className="flex flex-wrap gap-x-14 gap-y-8 border-t border-ash-900 pt-8">
            {about.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-3">
                <dt className="label text-ash-400">{stat.label}</dt>
                <dd className="font-display text-display-md text-accent">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DrawOnScroll className="mx-auto w-full max-w-xs text-rim md:col-span-5 md:max-w-sm">
          <HornedMask className="w-full drop-shadow-[0_0_18px_var(--color-glow)]" />
        </DrawOnScroll>
      </div>
    </Section>
  );
}
