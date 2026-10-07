import { ExternalLink } from "@/components/ui/slash-link";
import { profile } from "@/content/profile";

import { LocalTime } from "./local-time";
import { MotionToggle } from "./motion-toggle";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-ash-900">
      <div className="container-site flex flex-col gap-10 pt-12 pb-28 md:flex-row md:items-end md:justify-between md:pr-24 md:pb-12">
        <div className="space-y-3">
          <p className="font-display text-title text-bone">{profile.tagline}</p>
          <p className="label text-ash-400">
            © {year} {profile.name} · {profile.location} ·{" "}
            <LocalTime timeZone={profile.timeZone} className="tabular-nums" />
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <ul className="flex flex-wrap gap-6">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <ExternalLink href={social.href} className="label text-ash-200 hover:text-bone">
                  {social.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          <MotionToggle />
        </div>
      </div>
    </footer>
  );
}
