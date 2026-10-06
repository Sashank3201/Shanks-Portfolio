import Link from "next/link";

import { CrescentMark } from "@/components/illustrations/crescent-mark";
import { pageNav, sectionNav } from "@/content/navigation";
import { profile } from "@/content/profile";

import { RealmToggle } from "./realm-toggle";
import { SiteMenu } from "./site-menu";

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-(--z-header)">
      <div className="container-site flex h-(--header-height) items-center justify-between gap-6">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-3 text-bone"
          aria-label={`${profile.name} — home`}
        >
          <CrescentMark className="size-7 text-accent transition-transform duration-700 ease-reiatsu group-hover:rotate-[-24deg]" />
          <span className="hidden label text-bone sm:inline">{profile.name}</span>
        </Link>

        <nav aria-label="Primary" className="pointer-events-auto hidden md:block">
          <ul className="flex items-center gap-7">
            {[...sectionNav, ...pageNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label text-ash-200 transition-colors duration-300 hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pointer-events-auto flex items-center gap-3">
          <RealmToggle />
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
