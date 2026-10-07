import { Seal } from "@/components/illustrations/seal";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { arsenal } from "@/content/home";
import { cn } from "@/lib/utils/cn";

const ALL_SKILLS = arsenal.flatMap((group) => group.skills);
const HALF = Math.ceil(ALL_SKILLS.length / 2);

function MarqueeRow({ skills, outlined }: { skills: string[]; outlined: boolean }) {
  return skills.map((skill, index) => (
    <span
      key={skill}
      className={cn(
        "flex items-center gap-10 pr-10 font-display text-display-lg whitespace-nowrap",
        (index % 2 === 0) === outlined
          ? "text-transparent [-webkit-text-stroke:1px_var(--color-ash-600)]"
          : "text-ash-200",
      )}
    >
      {skill}
      <span aria-hidden="true" className="size-3 rotate-45 bg-accent" />
    </span>
  ));
}

/** 肆 Arsenal — skills as velocity-reactive marquees and sealed groups. */
export function Arsenal() {
  return (
    <Section
      id="arsenal"
      numeral="肆"
      glyph="技"
      eyebrow="Arsenal"
      title="Techniques, sealed and released."
      realm={0.8}
      className="overflow-x-clip"
    >
      {/* Decorative: the same skills are listed, readable, in the groups below. */}
      <div
        aria-hidden="true"
        className="relative left-1/2 mt-16 w-screen -translate-x-1/2 space-y-3 md:mt-24"
      >
        <Marquee speed={46}>
          <MarqueeRow skills={ALL_SKILLS.slice(0, HALF)} outlined={false} />
        </Marquee>
        <Marquee speed={-46}>
          <MarqueeRow skills={ALL_SKILLS.slice(HALF)} outlined />
        </Marquee>
      </div>

      <Reveal className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {arsenal.map((group) => (
          <div
            key={group.name}
            className="group rounded-2xl border border-ash-900 bg-abyss/70 p-8 transition-colors duration-500 hover:border-accent/40"
          >
            <Seal
              glyph={group.glyph}
              className="size-16 text-ash-400 transition-[color,filter] duration-500 group-hover:text-accent group-hover:drop-shadow-[0_0_12px_var(--color-accent)]"
            />
            <h3 className="mt-6 font-display text-title text-bone">{group.name}</h3>
            <ul className="mt-4 space-y-2 text-ash-200">
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
