import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { parseSiteContent } from "@/lib/site-content";

describe("parseSiteContent", () => {
  it("accepts the site without a Google Ads call conversion", () => {
    expect(() => parseSiteContent({ ...site, googleAds: { phoneConversion: null } })).not.toThrow();
  });

  it("fails the build with a malformed call conversion", () => {
    expect(() => parseSiteContent({ ...site, googleAds: { phoneConversion: "AW-123" } })).toThrow(/phoneConversion/);
  });
});
