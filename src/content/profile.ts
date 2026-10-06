import { profileSchema } from "./schema";

/**
 * Identity shown across the site, the résumé and structured data.
 * TODO(content): replace the placeholder values with real details.
 */
export const profile = profileSchema.parse({
  name: "Shanks",
  katakana: "シャンクス",
  role: "Creative Developer",
  tagline: "Interfaces forged under the eclipse.",
  location: "Earth",
  timeZone: "UTC",
  email: "hello@example.com",
  availability: "Open to select collaborations",
  socials: [{ label: "GitHub", href: "https://github.com/Sashank3201", handle: "@Sashank3201" }],
});
