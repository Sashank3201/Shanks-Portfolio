import { describe, expect, it } from "vitest";
import { z } from "zod";

import { pageNav, sectionNav } from "./navigation";
import { profile } from "./profile";
import { navItemSchema, profileSchema } from "./schema";

describe("content", () => {
  it("profile satisfies its schema", () => {
    expect(() => profileSchema.parse(profile)).not.toThrow();
  });

  it("navigation satisfies its schema and has unique targets", () => {
    const items = [...sectionNav, ...pageNav];
    expect(() => z.array(navItemSchema).parse(items)).not.toThrow();
    expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
  });

  it("rejects an unknown time zone", () => {
    expect(() => profileSchema.parse({ ...profile, timeZone: "Mars/Olympus_Mons" })).toThrow();
  });

  it("rejects a non-katakana hero label", () => {
    expect(() => profileSchema.parse({ ...profile, katakana: "Shanks" })).toThrow();
  });
});
