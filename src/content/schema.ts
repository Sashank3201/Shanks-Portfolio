import { z } from "zod";

/** Validates an IANA time zone name using the platform's Intl data. */
const timeZone = z.string().refine((value) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Unknown IANA time zone");

export const socialSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
  handle: z.string().min(1).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Name in katakana for the vertical hero label — glyphs must exist in the JP subset. */
  katakana: z.string().regex(/^\p{Script_Extensions=Katakana}+$/u, "Katakana only"),
  role: z.string().min(1),
  tagline: z.string().min(1),
  location: z.string().min(1),
  timeZone,
  email: z.email(),
  availability: z.string().min(1),
  socials: z.array(socialSchema).min(1),
});

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith("/"),
  /** Formal numeral for home sections (壱, 弐 …). */
  numeral: z.string().optional(),
});

export type Social = z.infer<typeof socialSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
