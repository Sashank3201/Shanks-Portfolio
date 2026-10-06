import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
  description: "WebGL and motion experiments.",
};

export default function LabPage() {
  return (
    <main id="main" className="container-site flex min-h-dvh flex-col justify-center py-40">
      <p className="mb-6 label text-ash-400">
        <span lang="ja" aria-hidden="true" className="mr-3 font-jp text-accent">
          実験
        </span>
        Lab
      </p>
      <h1 className="font-display text-display-xl">Experiments are brewing.</h1>
      <p className="mt-8 max-w-prose text-lead text-ash-200">
        Shader studies, particle systems and motion sketches will live here.
      </p>
    </main>
  );
}
