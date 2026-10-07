# Eclipse — portfolio

A two-realm portfolio: a silver eclipse over a gothic spire that descends, section by section,
into a crimson realm — and a **Release** toggle that takes you there at once. Built with
Next.js 16 (App Router, React 19.3), Tailwind CSS 4, GSAP 3.15, Lenis and React Three Fiber.

## Quick start

```bash
corepack enable
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script           | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Dev server (Turbopack)                    |
| `pnpm build`     | Production build (all routes prerendered) |
| `pnpm start`     | Serve the production build                |
| `pnpm lint`      | ESLint (type-aware, zero warnings)        |
| `pnpm typecheck` | Generate route types and run `tsc`        |
| `pnpm test`      | Vitest unit/component tests               |
| `pnpm e2e`       | Playwright E2E + axe accessibility checks |
| `pnpm validate`  | Lint + types + unit tests + format check  |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — rendering model, layers, state, folder map
- [`docs/DESIGN.md`](docs/DESIGN.md) — realms, tokens, type, motion and art rules

## Deploy

The site is built for Vercel: import the repository, keep the default Next.js settings, and
set the environment variables listed in `.env.example` (only needed for the contact form).

## Art

All illustrations are original, made in code (SVG line art + GLSL shaders), inspired by the
mood of a set of reference frames. No third-party artwork ships with the site.
