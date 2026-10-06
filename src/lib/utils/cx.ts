/**
 * Class composition for Client Components: plain clsx, no conflict merging.
 *
 * `cn` (clsx + tailwind-merge) is for Server Components, where it costs nothing in the browser.
 * Client components compose their own classes and never need merging, so they use `cx` and keep
 * tailwind-merge (~9 KB gz) out of the client bundle. Enforced by `client-bundle.test.ts`.
 */
export { clsx as cx } from "clsx";
