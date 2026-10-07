import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { CrescentMark } from "@/components/illustrations/crescent-mark";
import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { MaskGlyph } from "@/components/illustrations/mask-glyph";
import { Button, ButtonLink } from "@/components/ui/button";
import { KanjiIndex } from "@/components/ui/kanji-index";
import { SlashLink } from "@/components/ui/slash-link";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const PALETTE = [
  "void",
  "abyss",
  "ash-900",
  "ash-800",
  "ash-600",
  "ash-400",
  "ash-200",
  "bone",
  "spirit",
  "spirit-deep",
  "reiatsu",
  "ember",
  "blood",
  "maroon",
] as const;

const TYPE_SCALE = [
  ["display-2xl", "text-display-2xl"],
  ["display-xl", "text-display-xl"],
  ["display-lg", "text-display-lg"],
  ["display-md", "text-display-md"],
  ["title", "text-title"],
  ["lead", "text-lead"],
] as const;

function realmStyle(realm: number): CSSProperties {
  return { "--realm": realm } as CSSProperties;
}

/** Development-only reference of tokens and primitives. */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="main" className="container-site space-y-24 py-40">
      <header className="space-y-4">
        <p className="label text-ash-400">Design system</p>
        <h1 className="font-display text-display-xl">Style guide</h1>
      </header>

      <section aria-labelledby="sg-palette" className="space-y-8">
        <h2 id="sg-palette" className="label text-ash-200">
          Palette
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {PALETTE.map((token) => (
            <li key={token} className="space-y-2">
              <div
                className="aspect-square rounded-lg border border-ash-800"
                style={{ backgroundColor: `var(--color-${token})` }}
              />
              <p className="label text-ash-400">{token}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-realms" className="space-y-8">
        <h2 id="sg-realms" className="label text-ash-200">
          Realm tokens (local --realm override)
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 0.5, 1].map((realm) => (
            <div
              key={realm}
              style={realmStyle(realm)}
              className="space-y-6 rounded-2xl border border-ash-900 bg-abyss p-8"
            >
              <p className="label text-ash-400">realm {realm}</p>
              <div className="flex gap-3">
                <span className="size-12 rounded-full bg-accent" />
                <span className="size-12 rounded-full bg-accent-deep" />
                <span className="size-12 rounded-full bg-glow" />
              </div>
              <p className="font-display text-display-md text-accent glow">Reiatsu</p>
              <EclipseFallback className="mx-auto w-40" />
              <Button>Release</Button>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="sg-type" className="space-y-8">
        <h2 id="sg-type" className="label text-ash-200">
          Type scale
        </h2>
        {TYPE_SCALE.map(([name, className]) => (
          <div key={name} className="flex items-baseline gap-6 border-b border-ash-900 pb-6">
            <span className="w-28 shrink-0 label text-ash-400">{name}</span>
            <span className={`font-display ${className}`}>Under the eclipse</span>
          </div>
        ))}
        <p className="max-w-prose">
          Body copy in Geist. Interfaces forged under the eclipse — precise, fast and accessible,
          with motion that explains rather than decorates.
        </p>
        <p className="label text-ash-400">Label · Geist Mono · 0.28em tracking</p>
      </section>

      <section aria-labelledby="sg-components" className="space-y-8">
        <h2 id="sg-components" className="label text-ash-200">
          Components
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Accent button</Button>
          <Button tone="ghost">Ghost button</Button>
          <Button size="sm">Small</Button>
          <ButtonLink href="/" size="lg">
            Link button
          </ButtonLink>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <SlashLink href="/">Slash link</SlashLink>
          <KanjiIndex numeral="弐" glyph="刃" />
          <CrescentMark className="size-10 text-accent" />
          <MaskGlyph className="size-10 text-reiatsu" />
        </div>
      </section>
    </main>
  );
}
