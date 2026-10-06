import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { Section } from "@/components/ui/section";
import { profile } from "@/content/profile";

export default function HomePage() {
  return (
    <main id="main">
      <section
        aria-labelledby="hero-title"
        data-realm={0}
        className="relative isolate flex min-h-dvh flex-col justify-end overflow-hidden pb-[12vh]"
      >
        <EclipseFallback className="absolute top-[34%] left-1/2 -z-10 w-[min(64vw,30rem)] -translate-x-1/2 -translate-y-1/2" />

        <p
          lang="ja"
          aria-hidden="true"
          className="absolute top-[calc(var(--header-height)+3rem)] right-(--gutter) font-jp text-lg tracking-[0.5em] whitespace-nowrap text-ash-400 [writing-mode:vertical-rl] md:top-auto md:bottom-[14vh] md:text-xl"
        >
          {profile.katakana}
        </p>

        <div className="relative container-site">
          <p className="mb-6 label text-ash-200">{profile.role}</p>
          <h1 id="hero-title" className="font-display text-display-2xl font-medium glow">
            {profile.name}
          </h1>
          <p className="mt-8 max-w-md text-lead text-ash-200">{profile.tagline}</p>
        </div>
      </section>

      <Section
        id="about"
        numeral="壱"
        glyph="魂"
        eyebrow="About"
        title="A soul split between precision and spectacle."
        realm={0.15}
      />
      <Section
        id="work"
        numeral="弐"
        glyph="刃"
        eyebrow="Selected work"
        title="Blades forged in production."
        realm={0.35}
      />
      <Section
        id="path"
        numeral="参"
        glyph="道"
        eyebrow="Path"
        title="Every battle left a mark."
        realm={0.65}
      />
      <Section
        id="arsenal"
        numeral="肆"
        glyph="技"
        eyebrow="Arsenal"
        title="Techniques, sealed and released."
        realm={0.8}
      />
      <Section
        id="contact"
        numeral="伍"
        glyph="門"
        eyebrow="Contact"
        title="The gate is open."
        realm={1}
      />
    </main>
  );
}
