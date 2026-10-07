import type { ReactNode } from "react";

import { Cleaver } from "@/components/illustrations/cleaver";
import { EclipseFallback } from "@/components/illustrations/eclipse-fallback";
import { Gate } from "@/components/illustrations/gate";
import { HornedMask } from "@/components/illustrations/horned-mask";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { projects, type CoverMotif, type Project } from "@/content/home";

/** Generated covers: the house illustrations, until real screenshots arrive. */
const MOTIFS: Record<CoverMotif, ReactNode> = {
  eclipse: <EclipseFallback className="w-[44%]" />,
  cleaver: <Cleaver className="h-[82%] rotate-[24deg] text-rim" />,
  gate: <Gate className="w-[64%] translate-y-[6%] text-rim" />,
  mask: <HornedMask className="h-[78%] text-rim" />,
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const titleId = `project-${project.slug}`;

  return (
    <article aria-labelledby={titleId} className="group relative md:even:translate-y-28">
      <div
        aria-hidden="true"
        className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-ash-900 bg-abyss transition-colors duration-700 ease-reiatsu group-hover:border-accent/40"
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,color-mix(in_oklch,var(--color-accent)_18%,transparent),transparent_72%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
        <span
          lang="ja"
          className="absolute -right-2 -bottom-10 font-jp text-[10rem] leading-none text-ash-900 select-none"
        >
          {project.cover.glyph}
        </span>
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-reiatsu group-hover:scale-[1.05]">
          {MOTIFS[project.cover.motif]}
        </div>
        <span className="absolute top-5 left-5 label text-ash-400">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-7 flex items-baseline justify-between gap-6">
        <h3 id={titleId} className="font-display text-title text-bone">
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              data-cursor-label="Open"
              className="after:absolute after:inset-0 after:rounded-2xl"
            >
              {project.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            project.title
          )}
        </h3>
        <p className="shrink-0 label text-ash-400">{project.year}</p>
      </div>
      <p className="mt-2 label text-accent">{project.role}</p>
      <p className="mt-4 max-w-prose text-ash-200">{project.summary}</p>
      <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <li
            key={item}
            className="rounded-full border border-ash-800 px-3 py-1.5 label text-ash-200"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

/** 弐 Work — selected projects with generated covers, staggered like a contact sheet. */
export function Work() {
  return (
    <Section
      id="work"
      numeral="弐"
      glyph="刃"
      eyebrow="Selected work"
      title="Blades forged in production."
      realm={0.35}
    >
      <Reveal className="mt-16 grid gap-x-12 gap-y-20 md:mt-24 md:grid-cols-2 md:pb-28">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </Reveal>
    </Section>
  );
}
