import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom font-size scale, otherwise `text-display-xl` is mistaken
 * for a text colour and silently dropped when combined with `text-accent`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display-2xl", "display-xl", "display-lg", "display-md", "title", "lead", "label"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
