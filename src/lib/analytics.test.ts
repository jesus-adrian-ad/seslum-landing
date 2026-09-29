import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS, buildEvent } from "@/lib/analytics";

describe("buildEvent", () => {
  it("keeps the event name even if a param tries to override it", () => {
    expect(buildEvent(ANALYTICS_EVENTS.whatsappClick, { event: "spoofed", source: "floating" })).toEqual({
      event: "click_whatsapp",
      source: "floating",
    });
  });

  it("builds events without params", () => {
    expect(buildEvent(ANALYTICS_EVENTS.lead)).toEqual({ event: "generate_lead" });
  });
});
