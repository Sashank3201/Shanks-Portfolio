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

## WebGL stage

- One persistent `<Canvas>` (single GL context) mounted lazily behind the content
  (`fixed`, `z-index: -1`; the body stays transparent so it shows through).
- **Sky** — one full-screen triangle running `shaders/sky.ts`: void gradient, domain-warped smoke
  lit by the eclipse, corona + streamers, ring/limb and the moon that swings from annulus to
  crescent with the realm, the SDF spire with windows, outline and beam.
- **Ash field** — screen-space point sprites; ash drifts down in the Shinigami realm, embers rise
  in the Hollow (flow is integrated on the CPU so direction changes never jump).
- **Flames** — one instanced quad per `[data-flame-anchor]` (≤ 16), placed in document space
  from rects the stage loader measures (`lib/scene/measure-flames.ts`) on resize, layout change
  and route change, and scrolled in the vertex shader. The canvas sits behind the DOM, so the
  flames are scaled to burn past the silhouette in front of them; intensity is realm².
- **Composition** (`webgl/composition.ts`, unit-tested) maps scroll + the hero's
  `[data-eclipse-anchor]` rect to eclipse/spire placement, so the WebGL eclipse lands exactly
  where the CSS eclipse and the preloader ring are.
- **Hand-off** — until the first frame (and forever without WebGL) the CSS eclipse carries the
  look; `html[data-webgl]` is `ready | fallback | lost | failed`.
- **No GPU, no WebGL** — software rasterisers (SwiftShader, llvmpipe) and Save-Data keep the CSS
  eclipse and the SVG spire (`[data-stage-fallback]`, same geometry as the SDF): a full-screen
  shader on the CPU would stall the main thread.

Query flags: `?static=1` (frozen, motion-free frames for visual tests), `?webgl=force` (run the
stage even on software renderers — WebGL E2E tests), `?debug` (Leva + stats-gl, lazy-loaded), `?tier=1|2|3` (pin the quality tier, no runtime
adaptation — e.g. to capture the full look with `?webgl=force` on a machine without a GPU).

## Performance (measured, gzip)

| Budget                       | Target   | Now      |
| ---------------------------- | -------- | -------- |
| Initial JS (home)            | ≤ 200 KB | 200 KB   |
| Deferred WebGL chunk         | ≤ 300 KB | 275 KB   |
| Framework floor (React+Next) | —        | ≈ 125 KB |

Kept lean by: content as plain typed data (Zod runs at build time only), `cx` instead of `cn`
in client code (tailwind-merge stays server-side), first-visit-only sequences (preloader, hero
intro, DrawSVG, ScrambleText) loaded on demand, overlays loaded after hydration. A unit test
walks the client module graph and fails if tailwind-merge, Zod or server-only code is reachable.

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
  lib/            motion registry, scene signal + DOM measurement, SEO, env, utils
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
- **No r3f-perf** — its published source map lists a binary `.woff` as the original source
  (`sourcesContent: null`), which panics Turbopack's dev source-map step ("invalid utf-8 …
  index 11"). `?debug` uses drei's `StatsGl` plus Leva monitors for renderer counters instead.
  A scan of every `.map` in `node_modules` found no other package with that pattern.
