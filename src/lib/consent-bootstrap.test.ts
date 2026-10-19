import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildConsentDefault, CONSENT_MAX_AGE_MS, CONSENT_STORAGE_KEY, parseStoredConsent } from "@/lib/consent";
import { buildConsentBootstrapScript } from "@/lib/consent-bootstrap";

const NOW = Date.UTC(2026, 9, 18);

interface FakeWindow {
  dataLayer?: unknown[];
  localStorage: { getItem: (key: string) => string | null };
}

function run(stored: string | null, storage?: FakeWindow["localStorage"]): unknown[] {
  const fakeWindow: FakeWindow = {
    localStorage: storage ?? { getItem: (key) => (key === CONSENT_STORAGE_KEY ? stored : null) },
  };
  runInNewContext(buildConsentBootstrapScript(), { window: fakeWindow, Date });
  return fakeWindow.dataLayer ?? [];
}

function record(analytics: unknown, advertising: unknown, decidedAt: unknown): string {
  return JSON.stringify({ analytics, advertising, decidedAt });
}

const CASES: ReadonlyArray<readonly [string, string | null]> = [
  ["no decision", null],
  ["accepted all", record(true, true, NOW - 1000)],
  ["analytics only", record(true, false, NOW - 1000)],
  ["advertising only", record(false, true, NOW - 1000)],
  ["rejected all", record(false, false, NOW - 1000)],
  ["at the expiry limit", record(true, true, NOW - CONSENT_MAX_AGE_MS)],
  ["expired", record(true, true, NOW - CONSENT_MAX_AGE_MS - 1)],
  ["decided in the future", record(true, true, NOW + 1000)],
  ["malformed json", "{oops"],
  ["json null", "null"],
  ["an array", "[true,true,1]"],
  ["string flags", record("true", true, NOW)],
  ["missing date", JSON.stringify({ analytics: true, advertising: true })],
];

describe("buildConsentBootstrapScript", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(CASES)("declares the same default as the banner logic when %s", (_label, stored) => {
    const dataLayer = run(stored);
    expect(dataLayer).toHaveLength(1);
    const command = Array.from(dataLayer[0] as ArrayLike<unknown>);
    expect(command).toEqual(["consent", "default", buildConsentDefault(parseStoredConsent(stored, NOW))]);
  });

  it("publishes the command as an arguments object, as Consent Mode requires", () => {
    const [command] = run(null);
    expect(Array.isArray(command)).toBe(false);
    expect(Object.prototype.toString.call(command)).toBe("[object Arguments]");
  });

  it("falls back to denied when storage is unavailable", () => {
    const dataLayer = run(null, {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    expect(Array.from(dataLayer[0] as ArrayLike<unknown>)[2]).toEqual(buildConsentDefault(null));
  });

  it("keeps entries already in the dataLayer", () => {
    const fakeWindow = { dataLayer: [{ event: "earlier" }], localStorage: { getItem: () => null } };
    runInNewContext(buildConsentBootstrapScript(), { window: fakeWindow, Date });
    expect(fakeWindow.dataLayer).toHaveLength(2);
    expect(fakeWindow.dataLayer[0]).toEqual({ event: "earlier" });
  });
});
