import type { Route } from "next";

import { navItemSchema } from "./schema";

interface TypedNavItem {
  label: string;
  href: Route;
  numeral?: string;
}

function defineNav(items: TypedNavItem[]): TypedNavItem[] {
  return items.map((item) => ({ ...navItemSchema.parse(item), href: item.href }));
}

/** Home sections, in scroll order. */
export const sectionNav = defineNav([
  { label: "About", href: "/#about", numeral: "壱" },
  { label: "Work", href: "/#work", numeral: "弐" },
  { label: "Path", href: "/#path", numeral: "参" },
  { label: "Arsenal", href: "/#arsenal", numeral: "肆" },
  { label: "Contact", href: "/#contact", numeral: "伍" },
]);

/** Standalone pages. */
export const pageNav = defineNav([
  { label: "Lab", href: "/lab" },
  { label: "Resume", href: "/resume" },
]);
