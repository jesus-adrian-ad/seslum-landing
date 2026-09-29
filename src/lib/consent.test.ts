import { describe, expect, it } from "vitest";
import {
  buildConsentDefault,
  CONSENT_WAIT_FOR_UPDATE_MS,
  parseStoredPreferences,
  serializePreferences,
  toConsentModeState,
} from "@/lib/consent";

describe("toConsentModeState", () => {
  it("maps advertising to the three ad signals and analytics to analytics_storage", () => {
    expect(toConsentModeState({ analytics: true, advertising: false })).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "granted",
      security_storage: "granted",
    });
  });
});

describe("buildConsentDefault", () => {
  it("denies everything optional when the visitor has not decided", () => {
    const state = buildConsentDefault(null);
    expect(state.analytics_storage).toBe("denied");
    expect(state.ad_storage).toBe("denied");
    expect(state.wait_for_update).toBe(CONSENT_WAIT_FOR_UPDATE_MS);
  });

  it("restores a stored decision", () => {
    expect(buildConsentDefault({ analytics: true, advertising: true }).ad_user_data).toBe("granted");
  });
});

describe("parseStoredPreferences", () => {
  it("round-trips serialized preferences", () => {
    const prefs = { analytics: true, advertising: false };
    expect(parseStoredPreferences(serializePreferences(prefs))).toEqual(prefs);
  });

  it.each([null, "", "not json", "null", "[]", '{"analytics":"yes","advertising":false}', '{"analytics":true}'])(
    "rejects invalid input %j",
    (raw) => {
      expect(parseStoredPreferences(raw)).toBeNull();
    },
  );
});
