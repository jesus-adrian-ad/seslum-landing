import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENTS,
  TRACK_EVENT_ATTRIBUTE,
  TRACK_SOURCE_ATTRIBUTE,
  buildEvent,
  parseTrackedClick,
  trackingAttributes,
} from "@/lib/analytics";

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

describe("trackingAttributes y parseTrackedClick", () => {
  it("lee de vuelta lo que marcan los atributos", () => {
    const attributes = trackingAttributes(ANALYTICS_EVENTS.phoneClick, "contact");
    expect(parseTrackedClick(attributes[TRACK_EVENT_ATTRIBUTE] ?? null, attributes[TRACK_SOURCE_ATTRIBUTE] ?? null)).toEqual({
      event: "click_phone",
      source: "contact",
    });
  });

  it("ignora eventos u orígenes que no están en el catálogo", () => {
    expect(parseTrackedClick("purchase", "contact")).toBeNull();
    expect(parseTrackedClick("click_phone", "sidebar")).toBeNull();
    expect(parseTrackedClick(null, "contact")).toBeNull();
  });
});
