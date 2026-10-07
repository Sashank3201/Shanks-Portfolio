import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lost in the Dangai",
  robots: { index: false },
};

/** The themed 404. */
export default function NotFound() {
  return (
    <main
      id="main"
      data-realm={1}
      className="container-site flex min-h-dvh flex-col justify-center py-40"
    >
      <p lang="ja" aria-hidden="true" className="font-jp text-xl tracking-[0.5em] text-ash-400">
        迷界
      </p>
      <p className="mt-8 label text-accent">404 — page not found</p>
      <h1 className="mt-5 font-display text-display-xl text-balance">Lost in the Dangai.</h1>
      <p className="mt-8 max-w-md text-lead text-ash-200">
        This path leads nowhere. The page you were looking for is not on this side of the gate.
      </p>
      <ButtonLink href="/" size="lg" className="mt-14 self-start">
        Return home
      </ButtonLink>
    </main>
  );
}
