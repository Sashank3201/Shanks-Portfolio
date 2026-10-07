import { DescentController } from "@/components/providers/descent-controller";
import { Hero } from "@/components/sections/hero";
import { Section } from "@/components/ui/section";

const CHAPTERS = [
  {
    id: "about",
    numeral: "壱",
    glyph: "魂",
    eyebrow: "About",
    title: "A soul split between precision and spectacle.",
    realm: 0.15,
  },
  {
    id: "work",
    numeral: "弐",
    glyph: "刃",
    eyebrow: "Selected work",
    title: "Blades forged in production.",
    realm: 0.35,
  },
  {
    id: "path",
    numeral: "参",
    glyph: "道",
    eyebrow: "Path",
    title: "Every battle left a mark.",
    realm: 0.65,
  },
  {
    id: "arsenal",
    numeral: "肆",
    glyph: "技",
    eyebrow: "Arsenal",
    title: "Techniques, sealed and released.",
    realm: 0.8,
  },
  {
    id: "contact",
    numeral: "伍",
    glyph: "門",
    eyebrow: "Contact",
    title: "The gate is open.",
    realm: 1,
  },
] as const;

export default function HomePage() {
  return (
    <main id="main">
      <DescentController />
      <Hero />
      {CHAPTERS.map((chapter) => (
        <Section key={chapter.id} {...chapter} />
      ))}
    </main>
  );
}
