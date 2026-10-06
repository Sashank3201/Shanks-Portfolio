import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Cursor } from "@/components/overlays/cursor";
import { Grain } from "@/components/overlays/grain";
import { Preloader } from "@/components/overlays/preloader";
import { RouteTransition } from "@/components/overlays/route-transition";
import { RealmBridge } from "@/components/providers/realm-bridge";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SkipLink } from "@/components/ui/skip-link";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { bootInlineScript } from "@/lib/realm/prefs";

import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: site.url,
  title: { default: site.title, template: `%s — ${profile.name}` },
  description: site.description,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  openGraph: {
    type: "website",
    siteName: profile.name,
    locale: site.locale,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Restores Release / reduce-motion and decides on the preloader before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: bootInlineScript }} />
      </head>
      <body className="min-h-dvh">
        <SkipLink />
        <RealmBridge />
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
        <ScrollProgress />
        <RouteTransition />
        <Preloader />
        <Cursor />
        <Grain />
      </body>
    </html>
  );
}
