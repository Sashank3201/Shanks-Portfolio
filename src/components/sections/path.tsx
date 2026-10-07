import { Section } from "@/components/ui/section";

import { PathTimeline } from "./path-timeline";

/** 参 Path — experience as a descending crimson line. */
export function Path() {
  return (
    <Section
      id="path"
      numeral="参"
      glyph="道"
      eyebrow="Path"
      title="Every battle left a mark."
      realm={0.65}
    >
      <PathTimeline />
    </Section>
  );
}
