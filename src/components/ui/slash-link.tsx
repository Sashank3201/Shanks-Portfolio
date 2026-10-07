import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

/** Underline that draws in from the left on hover and keyboard focus. */
export const slashLinkClass = cn(
  "relative inline-block bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat",
  "bg-[length:0%_1px] bg-[position:0_100%] transition-[background-size,color] duration-500 ease-reiatsu",
  "hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]",
);

interface SlashLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, "href"> {
  href: Route;
}

export function SlashLink({ className, ...props }: SlashLinkProps) {
  return <Link className={cn(slashLinkClass, className)} {...props} />;
}

interface ExternalLinkProps extends ComponentPropsWithoutRef<"a"> {
  href: string;
}

/** External link: opens in a new tab, with the destination announced to screen readers. */
export function ExternalLink({ className, children, ...props }: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(slashLinkClass, className)}
      {...props}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
