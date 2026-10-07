/**
 * Palette in sRGB hex for renderers that cannot read CSS custom properties (WebGL uniforms,
 * OG images, the PDF résumé). Mirrors the OKLCH tokens in src/styles/globals.css.
 */
export const PALETTE = {
  void: "#050507",
  abyss: "#0b0b10",
  ash900: "#16161b",
  ash800: "#2a2a31",
  ash600: "#55555f",
  ash400: "#8b8b96",
  ash200: "#c4c4cc",
  bone: "#ecebe6",
  spirit: "#9a96d8",
  spiritDeep: "#4a4785",
  reiatsu: "#ff2d2d",
  ember: "#ff6a3d",
  blood: "#b3121f",
  maroon: "#2a0710",
} as const;

export type PaletteToken = keyof typeof PALETTE;
