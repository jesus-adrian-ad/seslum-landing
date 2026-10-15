import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENTS,
  TRACK_EVENT_ATTRIBUTE,
  TRACK_SOURCE_ATTRIBUTE,
  THANK_YOU_VIRTUAL_PATH,
  buildEvent,
  parseTrackedClick,
  trackingAttributes,
  virtualPageViewParams,
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

describe("virtualPageViewParams", () => {
  it("arma la página vista virtual del agradecimiento con ruta, título y URL completa", () => {
    expect(
      buildEvent(
        ANALYTICS_EVENTS.virtualPageView,
        virtualPageViewParams(THANK_YOU_VIRTUAL_PATH, "Recibimos su solicitud", "https://seslum.com.mx"),
      ),
    ).toEqual({
      event: "virtual_page_view",
      page_path: "/gracias",
      page_title: "Recibimos su solicitud",
      page_location: "https://seslum.com.mx/gracias",
    });
  });
});
