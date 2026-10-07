import { profile } from "./profile";

/**
 * Canonical origin, in priority order: explicit override, Vercel's production domain, local dev.
 */
function resolveSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return new URL(`https://${vercelProduction}`);

  return new URL("http://localhost:3000");
}

export const site = {
  url: resolveSiteUrl(),
  title: `${profile.name} — ${profile.role}`,
  description: `${profile.role}. ${profile.tagline}`,
  locale: "en_US",
} as const;
