import "server-only";

import { z } from "zod";

import { pageNav, sectionNav } from "./navigation";
import { profile } from "./profile";
import { navItemSchema, profileSchema } from "./schema";

/**
 * Validates every content module against its Zod schema. Imported by the root layout, so it runs
 * while pages are prerendered: a content mistake fails `next build` instead of shipping.
 * Zod never reaches the client bundle — content modules themselves are plain typed data.
 */
export function validateContent(): void {
  profileSchema.parse(profile);
  z.array(navItemSchema).parse([...sectionNav, ...pageNav]);
}
