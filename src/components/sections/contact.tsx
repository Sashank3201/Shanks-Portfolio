import { CloakedFigure } from "@/components/illustrations/cloaked-figure";
import { Gate } from "@/components/illustrations/gate";
import { LocalTime } from "@/components/layout/local-time";
import { DrawOnScroll } from "@/components/motion/draw-on-scroll";
import { Magnetic } from "@/components/motion/magnetic";
import { Section } from "@/components/ui/section";
import { ExternalLink, slashLinkClass } from "@/components/ui/slash-link";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils/cn";

import { CopyEmail } from "./copy-email";
import { GateScene } from "./gate-scene";

/** 伍 Contact — the figure waits in the opening gate, burning in the Hollow realm. */
export function Contact() {
  return (
    <Section
      id="contact"
      numeral="伍"
      glyph="門"
      eyebrow="Contact"
      title="The gate is open."
      realm={1}
    >
      <div className="mt-16 grid items-end gap-20 md:mt-24 md:grid-cols-12 md:gap-12">
        <div className="space-y-10 md:col-span-6 md:pb-6">
          <p className="max-w-md text-lead text-ash-200">
            {profile.availability}. Tell me what you are building — I read every message.
          </p>
          <div className="space-y-6">
            <a
              href={`mailto:${profile.email}`}
              className={cn(
                slashLinkClass,
                "block w-fit font-display text-display-md break-all text-bone",
              )}
            >
              {profile.email}
            </a>
            <div>
              <Magnetic>
                <CopyEmail email={profile.email} />
              </Magnetic>
            </div>
          </div>
          <ul className="flex flex-wrap gap-6">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <ExternalLink href={social.href} className="label text-ash-200 hover:text-bone">
                  {social.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="label text-ash-400">
            Local time · <LocalTime timeZone={profile.timeZone} className="tabular-nums" />
          </p>
        </div>

        <GateScene className="relative mx-auto w-full max-w-xl md:col-span-6">
          <DrawOnScroll className="text-rim">
            <Gate className="w-full drop-shadow-[0_0_10px_var(--color-rim)]" />
          </DrawOnScroll>
          <div className="absolute bottom-0 left-1/2 w-[34%] -translate-x-1/2">
            <CloakedFigure className="w-full text-rim drop-shadow-[0_0_8px_var(--color-rim)]" />
          </div>
        </GateScene>
      </div>
    </Section>
  );
}
