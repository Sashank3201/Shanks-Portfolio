import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Experience, skills and contact details.",
};

export default function ResumePage() {
  return (
    <main id="main" className="container-site flex min-h-dvh flex-col justify-center py-40">
      <p className="mb-6 label text-ash-400">
        <span lang="ja" aria-hidden="true" className="mr-3 font-jp text-accent">
          履歴
        </span>
        Resume
      </p>
      <h1 className="font-display text-display-xl">The record is being written.</h1>
      <p className="mt-8 max-w-prose text-lead text-ash-200">
        A printable résumé and PDF download are on their way.
      </p>
    </main>
  );
}
