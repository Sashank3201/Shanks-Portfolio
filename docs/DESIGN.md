# Design system

## Concept: two realms

| Realm     | Value | Mood                                                         |
| --------- | ----- | ------------------------------------------------------------ |
| Shinigami | 0     | Silver eclipse ring, smoky corona, lavender spire light, ash |
| Hollow    | 1     | Black and crimson, red crescent, embers, glowing outlines    |

**Descent** — section targets: Hero 0 → About .15 → Work .35 → Path .65 → Arsenal .8 → Contact 1.
**Release** — header mask toggle forces 1 everywhere with a burn reveal; persisted.

## Palette

| Token       | Hex                                               | Use                          |
| ----------- | ------------------------------------------------- | ---------------------------- |
| void        | `#050507`                                         | page background              |
| abyss       | `#0b0b10`                                         | raised surfaces              |
| ash-900…100 | `#16161b` `#2a2a31` `#55555f` `#8b8b96` `#c4c4cc` | surfaces, muted text, clouds |
| bone        | `#ecebe6`                                         | primary text, eclipse glow   |
| spirit      | `#9a96d8`                                         | Shinigami accent             |
| spirit-deep | `#4a4785`                                         | Shinigami deep accent        |
| reiatsu     | `#ff2d2d`                                         | Hollow accent, focus ring    |
| ember       | `#ff6a3d`                                         | glows, sparks                |
| blood       | `#b3121f`                                         | deep red                     |
| maroon      | `#2a0710`                                         | Hollow ambience              |

Rules: text colors are realm-independent; only accents, glows and the scene shift. Every text
pair must pass WCAG AA in both realms.

## Type

- Display: **Cormorant Garamond** — sharp title-card serif, used large.
- Body: **Geist**. Labels/counters: **Geist Mono**.
- Japanese accents: **Noto Serif JP**, subset to the glyphs in use.
- Fluid `clamp()` scale; display sizes never below 2.5rem on mobile.

## Japanese accents

- Section numerals: 壱 弐 参 肆 伍. Labels: 魂 About · 刃 Work · 道 Path · 技 Arsenal · 門 Contact.
- Decorative glyphs carry `lang="ja"` and `aria-hidden="true"`; an English label is always present.
- Never use 卍 (misread outside Japan). No franchise names, logos or frames.

## Motion principles

1. **One clock** — everything is driven by `gsap.ticker`.
2. **Transform/opacity/clip-path/filter only**; no layout reads in loops.
3. **Every animation has a calm variant** under reduced motion (OS setting or in-site toggle).
4. **Eases**: `reiatsu` (power4.out) for reveals, `slash` (expo.inOut) for wipes, `drift`
   (sine.inOut) for ambient loops.
5. **Choreography over decoration** — motion should explain hierarchy (what arrives first).

## Art direction

- Original SVG line art: eclipse/crescent, gothic spire, horned mask, cleaver, cloaked figure,
  gate, cracks, seals. Graphic silhouettes + glowing crimson outlines; no character portraits.
- Atmosphere (corona, clouds, flames, ash, embers) is procedural GLSL — no bitmap textures.
- Reference frames live only in the git-ignored `references/` folder.
