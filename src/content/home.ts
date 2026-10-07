/**
 * Home-page content: about, work, path and arsenal. Plain typed data (safe to import from client
 * code), checked in `content.test.ts`.
 *
 * TODO(content): every entry below is a placeholder — replace it with your own story, projects,
 * experience and skills. Only "Eclipse" (this site) is real.
 */

export const about = {
  bio: "I build interfaces where engineering discipline meets spectacle — fast, accessible products whose motion explains instead of decorates. I care about the details most people skip: the first frame, the reduced-motion path, the slow network, the keyboard.",
  stats: [
    { value: "5+", label: "Years shipping" },
    { value: "40+", label: "Projects released" },
    { value: "100", label: "Accessibility score" },
  ],
} as const;

/** Illustration a project cover is built around. */
export type CoverMotif = "eclipse" | "cleaver" | "gate" | "mask";

export interface Project {
  slug: string;
  title: string;
  year: number;
  role: string;
  summary: string;
  stack: string[];
  href?: string;
  /** Cover art: one of the house illustrations plus a kanji (must be in the Japanese subset). */
  cover: { motif: CoverMotif; glyph: string };
}

export const projects: Project[] = [
  {
    slug: "eclipse",
    title: "Eclipse",
    year: 2026,
    role: "Design & development",
    summary:
      "This site: a descent from a silver eclipse to a crimson crescent, with a persistent WebGL sky, scroll and motion on one shared clock.",
    stack: ["Next.js", "GSAP", "Three.js", "GLSL"],
    href: "https://github.com/Sashank3201/Shanks-Portfolio",
    cover: { motif: "eclipse", glyph: "蝕" },
  },
  {
    slug: "ashfall",
    title: "Ashfall Analytics",
    year: 2025,
    role: "Frontend lead",
    summary:
      "Real-time operations dashboards: streaming charts that hold 60 fps with a million points, built on a typed query layer.",
    stack: ["React", "TypeScript", "WebGL", "WebSockets"],
    cover: { motif: "cleaver", glyph: "刃" },
  },
  {
    slug: "vesper",
    title: "Vesper Store",
    year: 2025,
    role: "Creative developer",
    summary:
      "A headless storefront with editorial motion, edge-rendered product pages and a sub-second largest contentful paint.",
    stack: ["Next.js", "Storefront API", "GSAP"],
    cover: { motif: "gate", glyph: "門" },
  },
  {
    slug: "lantern",
    title: "Lantern UI",
    year: 2024,
    role: "Design systems",
    summary:
      "An accessible component library adopted across four product teams — documented, themed and tested end to end.",
    stack: ["React", "Radix", "Tailwind CSS", "Playwright"],
    cover: { motif: "mask", glyph: "霊" },
  },
];

export interface PathEntry {
  period: string;
  role: string;
  place: string;
  summary: string;
}

export const path: PathEntry[] = [
  {
    period: "2024 — Now",
    role: "Creative Developer",
    place: "Independent",
    summary:
      "Interactive sites and product interfaces for studios and startups, from first sketch to launch.",
  },
  {
    period: "2022 — 2024",
    role: "Frontend Engineer",
    place: "Product studio",
    summary:
      "Shipped a design system and high-traffic marketing sites; led the move to Next.js and typed content.",
  },
  {
    period: "2020 — 2022",
    role: "Web Developer",
    place: "Digital agency",
    summary:
      "Campaign sites with WebGL and motion, delivered on agency timelines without dropping accessibility.",
  },
  {
    period: "2016 — 2020",
    role: "Computer Science",
    place: "University",
    summary: "Graphics, algorithms and human–computer interaction; first shaders written at 3 a.m.",
  },
];

export interface SkillGroup {
  /** Seal kanji (must be in the Japanese subset). */
  glyph: string;
  name: string;
  skills: string[];
}

export const arsenal: SkillGroup[] = [
  {
    glyph: "技",
    name: "Interface",
    skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Accessibility"],
  },
  {
    glyph: "衝",
    name: "Motion",
    skills: ["GSAP", "ScrollTrigger", "Lenis", "SVG", "View Transitions"],
  },
  {
    glyph: "霊",
    name: "Realtime graphics",
    skills: ["Three.js", "React Three Fiber", "GLSL", "WebGL"],
  },
  { glyph: "道", name: "Craft", skills: ["Vitest", "Playwright", "Performance", "CI/CD", "Figma"] },
];
