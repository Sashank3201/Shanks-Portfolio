"use client";

import { useEffect, useState } from "react";

import { cx } from "@/lib/utils/cx";

type CopyState = "idle" | "copied" | "failed";

const LABEL: Record<CopyState, string> = {
  idle: "Copy email",
  copied: "Copied",
  failed: "Copy failed — use the link",
};

/** Copies the address to the clipboard; the result is announced politely. */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timeout = window.setTimeout(() => {
      setState("idle");
    }, 2400);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [state]);

  const copy = () => {
    navigator.clipboard.writeText(email).then(
      () => {
        setState("copied");
      },
      () => {
        setState("failed");
      },
    );
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        "inline-flex h-12 items-center gap-3 rounded-full border px-6 label transition-[color,border-color] duration-500 ease-reiatsu",
        state === "copied"
          ? "border-accent text-bone"
          : "border-ash-800 text-ash-200 hover:border-ash-400 hover:text-bone",
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 rotate-45 bg-accent" />
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}
