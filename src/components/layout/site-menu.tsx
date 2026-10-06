"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { TransitionLink } from "@/components/ui/transition-link";
import { pageNav, sectionNav } from "@/content/navigation";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/ui-store";

import { MotionToggle } from "./motion-toggle";

/**
 * Full-screen menu for small screens, built on the native modal <dialog>: focus is trapped,
 * the page behind is inert and Escape closes it, all without custom focus management.
 */
export function SiteMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = useUiStore((state) => state.menuOpen);
  const setMenuOpen = useUiStore((state) => state.setMenuOpen);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Any navigation closes the menu.
  useEffect(() => {
    useUiStore.getState().setMenuOpen(false);
  }, [pathname]);

  const close = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => {
          setMenuOpen(true);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-ash-800 px-4 label text-ash-200 transition-colors hover:border-ash-400 hover:text-bone md:hidden"
      >
        Menu
      </button>

      <dialog
        id="site-menu"
        ref={dialogRef}
        aria-label="Site menu"
        onClose={close}
        className={cn(
          "m-0 h-dvh max-h-none w-full max-w-none bg-void/95 text-bone backdrop-blur-md",
          "opacity-0 transition-[opacity,display,overlay] transition-discrete duration-500 ease-reiatsu",
          "backdrop:bg-transparent open:opacity-100 starting:open:opacity-0",
        )}
      >
        <div className="container-site flex h-full flex-col py-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-full border border-ash-800 px-4 label text-ash-200 hover:text-bone"
            >
              Close
            </button>
          </div>

          <nav aria-label="Menu" className="mt-16 flex-1">
            <ul className="space-y-4">
              {sectionNav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    transitionLabel={item.label}
                    onClick={close}
                    className="group flex items-baseline gap-4 font-display text-display-md text-bone"
                  >
                    <span lang="ja" aria-hidden="true" className="font-jp text-base text-accent">
                      {item.numeral}
                    </span>
                    <span className="transition-colors group-hover:text-accent">{item.label}</span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
            <ul className="mt-12 flex gap-8">
              {pageNav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    transitionLabel={item.label}
                    onClick={close}
                    className="label text-ash-200 transition-colors hover:text-bone"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <MotionToggle />
        </div>
      </dialog>
    </>
  );
}
