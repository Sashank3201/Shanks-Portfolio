import { useId } from "react";

import { Marquee } from "@/components/motion/marquee";
import { Section } from "@/components/ui/section";
import { arsenal } from "@/content/home";
import { arcPath, polar } from "@/lib/art/arc";
import { cn } from "@/lib/utils/cn";

import { ArsenalCircle } from "./arsenal-circle";

const ALL_SKILLS = arsenal.flatMap((group) => group.skills);

/** Each group owns a quarter of the circle, with a gap for its seal. */
const QUARTER = 360 / arsenal.length;
const GAP = 14;
const C = 400;

function MarqueeRow({ skills }: { skills: string[] }) {
  return skills.map((skill, index) => (
    <span
      key={skill}
      className={cn(
        "flex items-center gap-10 pr-10 font-display text-display-lg whitespace-nowrap",
        index % 2 === 0
          ? "text-ash-200"
          : "text-transparent [-webkit-text-stroke:1px_var(--color-ash-600)]",
      )}
    >
      {skill}
      <span aria-hidden="true" className="size-3 rotate-45 bg-accent" />
    </span>
  ));
}

/** The sealing circle: rings of skills, a seal per group, an eight-point star and 技 at the core. */
function SealingCircle() {
  const id = useId();
  const star = [0, 45].map((turn) =>
    [0, 90, 180, 270]
      .map((corner) => polar(C, C, 168, corner + turn))
      .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" "),
  );

  return (
    <svg
      viewBox="0 0 800 800"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className="w-full text-ash-400"
    >
      <defs>
        {arsenal.map((group, index) => {
          const start = index * QUARTER + GAP / 2;
          return (
            <g key={group.name}>
              <path
                id={`${id}-skills-${index}`}
                d={arcPath(C, C, 352, start, start + QUARTER - GAP)}
              />
              <path
                id={`${id}-name-${index}`}
                d={arcPath(C, C, 222, start + 8, start + QUARTER - GAP - 8)}
              />
            </g>
          );
        })}
      </defs>

      <g data-ring-scroll>
        <g data-ring-spin>
          <circle cx={C} cy={C} r={390} strokeOpacity={0.45} />
          <circle cx={C} cy={C} r={378} strokeOpacity={0.6} strokeDasharray="1 9" strokeWidth={8} />
          {arsenal.map((group, index) => (
            <text
              key={group.name}
              data-arc={index}
              className="arsenal-arc font-mono"
              fontSize={13.5}
              letterSpacing={1.2}
              stroke="none"
            >
              <textPath href={`#${id}-skills-${index}`}>
                {group.skills.join("  ·  ").toUpperCase()}
              </textPath>
            </text>
          ))}
          <circle cx={C} cy={C} r={322} strokeOpacity={0.35} />
          {arsenal.map((group, index) => {
            const seal = polar(C, C, 290, index * QUARTER);
            return (
              <g key={group.name} data-arc={index} className="arsenal-seal">
                <circle cx={seal.x} cy={seal.y} r={27} className="fill-void" />
                <circle cx={seal.x} cy={seal.y} r={21} strokeDasharray="2 4" strokeOpacity={0.7} />
                <text
                  x={seal.x}
                  y={seal.y + 1}
                  lang="ja"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={24}
                  stroke="none"
                  className="arsenal-seal-glyph font-jp"
                >
                  {group.glyph}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      <g data-ring-counter>
        <circle cx={C} cy={C} r={258} strokeOpacity={0.3} />
        {star.map((points) => (
          <polygon key={points} points={points} strokeOpacity={0.55} />
        ))}
        {arsenal.map((group, index) => (
          <text
            key={group.name}
            data-arc={index}
            className="arsenal-arc arsenal-name font-display"
            fontSize={24}
            letterSpacing={2}
            stroke="none"
          >
            <textPath href={`#${id}-name-${index}`} startOffset="50%" textAnchor="middle">
              {group.name}
            </textPath>
          </text>
        ))}
      </g>

      <circle cx={C} cy={C} r={118} className="fill-void" strokeOpacity={0.7} />
      <circle cx={C} cy={C} r={104} strokeOpacity={0.35} strokeDasharray="3 6" />
      <text
        x={C}
        y={C + 4}
        lang="ja"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={112}
        stroke="none"
        className="arsenal-core font-jp"
      >
        技
      </text>
    </svg>
  );
}

/** 肆 Arsenal — a turning sealing circle of skills, read in full in the list beside it. */
export function Arsenal() {
  return (
    <Section
      id="arsenal"
      numeral="肆"
      glyph="技"
      eyebrow="Arsenal"
      title="Techniques, sealed and released."
      realm={0.8}
      glyphSide="right"
    >
      {/* Decorative: the same skills are listed, readable, beside the circle. */}
      <div
        aria-hidden="true"
        className="relative left-1/2 mt-16 w-screen -translate-x-1/2 md:mt-20"
      >
        <Marquee speed={46}>
          <MarqueeRow skills={ALL_SKILLS} />
        </Marquee>
      </div>

      <ArsenalCircle className="arsenal-circle mt-16 grid items-center gap-14 md:mt-24 md:grid-cols-12">
        <div className="mx-auto w-full max-w-[36rem] md:col-span-7">
          <SealingCircle />
        </div>
        <ul className="divide-y divide-ash-900 border-y border-ash-900 md:col-span-5">
          {arsenal.map((group, index) => (
            <li key={group.name} data-group={index} className="group flex gap-6 py-6">
              <span
                lang="ja"
                aria-hidden="true"
                className="font-jp text-3xl leading-none text-ash-400 transition-colors duration-500 group-hover:text-accent"
              >
                {group.glyph}
              </span>
              <div>
                <h3 className="font-display text-title text-bone">{group.name}</h3>
                <p className="mt-2 text-ash-200">{group.skills.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ul>
      </ArsenalCircle>
    </Section>
  );
}
