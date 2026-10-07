@AGENTS.md

# Eclipse portfolio — working notes

A two-realm portfolio (Next.js App Router + GSAP + R3F). Read `docs/ARCHITECTURE.md` and
`docs/DESIGN.md` before changing structure, motion or visuals.

## Commands

| Task                  | Command                             |
| --------------------- | ----------------------------------- |
| Dev server            | `pnpm dev`                          |
| Lint (zero warnings)  | `pnpm lint`                         |
| Types (+ route types) | `pnpm typecheck`                    |
| Unit tests            | `pnpm test`                         |
| Format                | `pnpm format` / `pnpm format:check` |
| Production build      | `pnpm build`                        |
| E2E + axe (on build)  | `pnpm e2e`                          |
| Everything but E2E    | `pnpm validate`                     |

In cloud sessions use the pre-installed Chromium for E2E:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium pnpm e2e`.

## Conventions

- Server Components by default; `"use client"` only on interactive leaves.
- Files kebab-case, components PascalCase, hooks `use-*.ts` exporting `useX`.
- Every GSAP animation lives in `useGSAP` with a scope ref and declares a reduced-motion branch.
- WebGL uniforms are mutated through refs inside `useFrame`, never via React state.
- Content lives in `src/content/*` as plain typed data; `content/validate.ts` (server-only) runs
  the Zod schemas during `next build`, and `content.test.ts` runs them in CI.
- Client Components use `cx` (clsx); `cn` (tailwind-merge) is for Server Components only —
  `src/lib/client-bundle.test.ts` enforces this transitively, along with no Zod in the client.
- First-visit-only motion (preloader, hero intro) lives in lazily imported sequence modules.
- Query flags: `?static=1` (frozen frames), `?webgl=force` (WebGL on software renderers),
  `?debug` (Leva + r3f-perf).
- Conventional Commits (`feat:`, `fix:`, `chore:` …) — enforced by commitlint.
- Toolchain pins: TypeScript 5.9 (typescript-eslint does not support TS 7 yet) and ESLint 9
  (eslint-config-next's react/import/jsx-a11y plugins top out at ESLint 9).
- Never commit the reference anime frames; keep them in the git-ignored `references/` folder.
