import localFont from "next/font/local";

/**
 * Self-hosted fonts (SIL OFL 1.1, licences in src/assets/fonts).
 * Only the display face is preloaded: it carries the hero name (the LCP element).
 */
export const displayFont = localFont({
  src: [
    {
      path: "../assets/fonts/web/cormorant-garamond-latin-wght-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../assets/fonts/web/cormorant-garamond-latin-wght-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
});

export const sansFont = localFont({
  src: "../assets/fonts/web/geist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
  preload: false,
});

export const monoFont = localFont({
  src: "../assets/fonts/web/geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

/** Japanese accents: a ~34 KB subset built by `pnpm fonts:jp`. */
export const jpFont = localFont({
  src: "../assets/fonts/web/noto-serif-jp-accents.woff2",
  weight: "500",
  variable: "--font-jp-accents",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const fontVariables = [displayFont, sansFont, monoFont, jpFont]
  .map((font) => font.variable)
  .join(" ");
