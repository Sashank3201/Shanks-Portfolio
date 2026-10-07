import { DescentController } from "@/components/providers/descent-controller";
import { About } from "@/components/sections/about";
import { Arsenal } from "@/components/sections/arsenal";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Path } from "@/components/sections/path";
import { Work } from "@/components/sections/work";

/** The descent: each chapter eases the site deeper, from the silver eclipse to the Hollow. */
export default function HomePage() {
  return (
    <main id="main">
      <DescentController />
      <Hero />
      <About />
      <Work />
      <Path />
      <Arsenal />
      <Contact />
    </main>
  );
}
