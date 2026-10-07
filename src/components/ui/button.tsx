import { cva, type VariantProps } from "class-variance-authority";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  [
    "group/button relative isolate inline-flex items-center justify-center gap-3 overflow-hidden",
    "rounded-full border label whitespace-nowrap",
    "transition-[color,border-color] duration-500 ease-reiatsu",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      tone: {
        accent: "border-accent/60 text-bone hover:border-accent",
        ghost: "border-ash-800 text-ash-200 hover:border-ash-400 hover:text-bone",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-12 px-6",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: { tone: "accent", size: "md" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** The fill that sweeps in from the left on hover/focus. */
function ButtonFill() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 -z-10 origin-left scale-x-0 bg-accent/15",
        "transition-transform duration-700 ease-reiatsu",
        "group-hover/button:scale-x-100 group-focus-visible/button:scale-x-100",
      )}
    />
  );
}

export interface ButtonProps extends ComponentPropsWithoutRef<"button">, ButtonVariantProps {
  children: ReactNode;
}

export function Button({
  className,
  tone,
  size,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ tone, size }), className)} {...props}>
      <ButtonFill />
      {children}
    </button>
  );
}

export interface ButtonLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "href">, ButtonVariantProps {
  href: Route;
  children: ReactNode;
}

export function ButtonLink({ className, tone, size, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ tone, size }), className)} {...props}>
      <ButtonFill />
      {children}
    </Link>
  );
}
