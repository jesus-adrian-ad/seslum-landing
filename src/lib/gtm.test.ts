import { describe, expect, it } from "vitest";
import { buildGtmScriptUrl, buildGtmStartEvent, isValidGtmId } from "@/lib/gtm";

describe("isValidGtmId", () => {
  it.each(["GTM-ABC1234", "GTM-K9X2PQ"])("accepts %s", (id) => {
    expect(isValidGtmId(id)).toBe(true);
  });

  it.each(["", "GTM-", "gtm-abc1234", "G-ABC1234", "GTM-ABC1234\"><script>", " GTM-ABC1234"])("rejects %j", (id) => {
    expect(isValidGtmId(id)).toBe(false);
  });
});

describe("buildGtmScriptUrl", () => {
  it("points to the official container endpoint", () => {
    expect(buildGtmScriptUrl("GTM-ABC1234")).toBe("https://www.googletagmanager.com/gtm.js?id=GTM-ABC1234");
  });
});

describe("buildGtmStartEvent", () => {
  it("emits the gtm.js start event with the given timestamp", () => {
    expect(buildGtmStartEvent(42)).toEqual({ "gtm.start": 42, event: "gtm.js" });
  });
});
