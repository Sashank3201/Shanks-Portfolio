import { TransitionLink } from "@/components/ui/transition-link";
import { pageNav, sectionNav } from "@/content/navigation";
import { profile } from "@/content/profile";

import { HeaderShell } from "./header-shell";
import { LogoMark } from "./logo-mark";
import { RealmToggle } from "./realm-toggle";
import { SiteMenu } from "./site-menu";

export function Header() {
  return (
    <HeaderShell>
      <div className="relative container-site flex h-(--header-height) items-center justify-between gap-6">
        <TransitionLink
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-3 text-bone"
          aria-label={`${profile.name} — home`}
        >
          <LogoMark className="size-7 text-accent transition-transform duration-700 ease-reiatsu group-hover:rotate-[-24deg]" />
          <span className="hidden label text-bone sm:inline">{profile.name}</span>
        </TransitionLink>

        <nav aria-label="Primary" className="pointer-events-auto hidden md:block">
          <ul className="flex items-center gap-7">
            {[...sectionNav, ...pageNav].map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  transitionLabel={item.label}
                  className="label text-ash-200 transition-colors duration-300 hover:text-bone"
                >
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pointer-events-auto flex items-center gap-3">
          <RealmToggle />
          <SiteMenu />
        </div>
      </div>
    </HeaderShell>
  );
}
