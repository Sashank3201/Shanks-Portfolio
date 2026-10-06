# Architecture

## Rendering model

- Every route is **statically prerendered**. Server Components are the default; client code is
  limited to interactive leaves (motion, toggles, the WebGL stage).
- All copy is real DOM (SEO + screen readers). WebGL is decorative and `aria-hidden`.
- The root layout stacks three layers that persist across navigations:

```
┌───────────────────────────────────────────────┐
│ 3. Overlays   preloader · slash · cursor · grain · menu
│ 2. Content    sections, smooth-scrolled by Lenis
│ 1. Stage      one fixed <Canvas> (single GL context) + CSS/SVG fallback
└───────────────────────────────────────────────┘
```

## One clock

`gsap.ticker` is the only animation-frame driver:

```
gsap.ticker ─▶ lenis.raf(time) ─▶ ScrollTrigger.update ─▶ R3F advance(time)
```

R3F runs with `frameloop="never"`, so scroll-linked DOM and WebGL can never drift by a frame.
The ticker pauses while the tab is hidden.

## Realm bridge

`realm ∈ [0, 1]` — 0 is the Shinigami realm (silver/lavender), 1 the Hollow realm (crimson).

```
target = release ? 1 : activeSection.realm
gsap tween ─┬─▶ <html style="--realm: …">   (CSS: color-mix in OKLCH re-tints accents)
            └─▶ uRealm uniform               (WebGL: eclipse → crescent, ash → embers)
```

Sections opt in declaratively, e.g. `<Section index="弐" label="刃" realm={0.35}>`.
Text colors never depend on the realm, so contrast is constant.

## Quality tiers

GPU tier detection plus a runtime performance monitor choose the pixel ratio (1–1.75), particle
counts, noise octaves, bloom resolution and whether the fluid simulation runs. Mobile gets a
lighter sky without the post-processing chunk. Reduced motion renders a single still frame.

## Routes

| Route                    | Notes                                              |
| ------------------------ | -------------------------------------------------- |
| `/`                      | Hero · About · Work · Path · Arsenal · Contact     |
| `/lab`, `/lab/[slug]`    | WebGL/motion experiments, lazy-loaded per slug     |
| `/resume`, `/resume.pdf` | Same content source; PDF generated at build time   |
| `not-found`              | Themed 404                                         |
| metadata routes          | `opengraph-image`, `sitemap`, `robots`, `manifest` |
| `/styleguide`            | Development only (404 in production)               |

## Folder map

```
src/
  app/            routes, metadata routes, route handlers
  actions/        server actions (contact)
  components/
    ui/           primitives (button, magnetic, slash-link, section, dialog…)
    layout/       header, menu overlay, footer, realm toggle, scroll crescent
    sections/     home sections
    motion/       text/scroll motion primitives
    overlays/     preloader, route transition, cursor, grain
    illustrations/ original SVG line art
  webgl/          stage, scenes, shaders (chunks + programs), hooks
  lab/            one folder per experiment
  content/        typed + Zod-validated content (single source of truth)
  lib/            motion registry, SEO, env, utils
  stores/         zustand UI store
  styles/         globals.css (Tailwind v4 @theme tokens)
tests/            e2e (Playwright + axe), setup
```

## Decisions

- **Next.js App Router** — persistent root layout keeps the WebGL context alive across routes.
- **GSAP only** for animation (plus CSS for trivial hovers) — one engine, automatic cleanup via
  `useGSAP`.
- **WebGL2 + GLSL**, not WebGPU/TSL yet: R3F v10 / drei v11 (WebGPU-first) are pre-release and
  pmndrs postprocessing is WebGL-only. Shaders are TS template strings with shared chunks so
  the later port is mechanical.
- **Typed content files + Zod** instead of a CMS — content errors fail the build.
