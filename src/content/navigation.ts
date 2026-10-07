import type { Route } from "next";

export interface NavLink {
  label: string;
  href: Route;
  /** Formal numeral for home sections (壱, 弐 …). */
  numeral?: string;
}

/** Home sections, in scroll order. */
export const sectionNav: NavLink[] = [
  { label: "About", href: "/#about", numeral: "壱" },
  { label: "Work", href: "/#work", numeral: "弐" },
  { label: "Path", href: "/#path", numeral: "参" },
  { label: "Arsenal", href: "/#arsenal", numeral: "肆" },
  { label: "Contact", href: "/#contact", numeral: "伍" },
];

/** Standalone pages. */
export const pageNav: NavLink[] = [
  { label: "Lab", href: "/lab" },
  { label: "Resume", href: "/resume" },
];
