import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("keeps a custom font size alongside a text colour", () => {
    expect(cn("text-display-xl", "text-accent")).toBe("text-display-xl text-accent");
  });

  it("resolves conflicts within the custom font-size scale", () => {
    expect(cn("text-display-xl", "text-display-md")).toBe("text-display-md");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
