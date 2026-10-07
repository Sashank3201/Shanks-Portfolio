"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import { navigateWithTransition } from "@/lib/motion/route-transition";
import { scrollToTarget } from "@/lib/motion/scroll";
import { isMotionReduced } from "@/stores/ui-store";

export interface TransitionLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, "href"> {
  href: Route;
  /** Title-card label shown while the slash covers the screen. */
  transitionLabel?: string;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.target === "_blank"
  );
}

/**
 * next/link with choreography:
 * - another page → Getsuga slash covers, navigates, reveals;
 * - a hash on the current page → smooth scroll (Lenis) and URL update, no reload;
 * - modified clicks, reduced motion and external URLs behave like a plain link.
 */
export function TransitionLink({ href, onClick, transitionLabel, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;

    if (url.pathname === pathname) {
      if (!url.hash) return;
      event.preventDefault();
      scrollToTarget(url.hash, { immediate: isMotionReduced() });
      window.history.pushState(null, "", url.hash);
      return;
    }

    if (isMotionReduced()) return;
    event.preventDefault();
    void navigateWithTransition(() => {
      router.push(href);
    }, transitionLabel);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
