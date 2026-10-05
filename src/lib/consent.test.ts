import { describe, expect, it } from "vitest";
import {
  buildConsentDefault,
  CONSENT_MAX_AGE_MS,
  CONSENT_WAIT_FOR_UPDATE_MS,
  parseStoredConsent,
  serializeConsent,
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

describe("parseStoredConsent", () => {
  const now = Date.UTC(2026, 9, 5);
  const prefs = { analytics: true, advertising: false };

  it("round-trips a recent decision", () => {
    expect(parseStoredConsent(serializeConsent(prefs, now - 1000), now)).toEqual(prefs);
  });

  it("asks again once the decision is older than twelve months", () => {
    expect(parseStoredConsent(serializeConsent(prefs, now - CONSENT_MAX_AGE_MS), now)).toEqual(prefs);
    expect(parseStoredConsent(serializeConsent(prefs, now - CONSENT_MAX_AGE_MS - 1), now)).toBeNull();
  });

  it("rejects a decision dated in the future", () => {
    expect(parseStoredConsent(serializeConsent(prefs, now + 60_000), now)).toBeNull();
  });

  it.each([
    null,
    "",
    "not json",
    "null",
    "[]",
    '{"analytics":"yes","advertising":false,"decidedAt":1}',
    '{"analytics":true,"advertising":false}',
    '{"analytics":true,"advertising":false,"decidedAt":"hoy"}',
  ])("rejects invalid input %j", (raw) => {
    expect(parseStoredConsent(raw, now)).toBeNull();
  });
});
