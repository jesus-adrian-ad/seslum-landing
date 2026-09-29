/**
 * Preferencias de consentimiento de cookies y su traducción a Consent Mode v2.
 *
 * Lógica pura: no toca el DOM ni el almacenamiento. Por defecto todo lo que no es
 * estrictamente necesario queda denegado hasta que el visitante decida.
 */

export const CONSENT_STORAGE_KEY = "seslum.consent.v1";

export const CONSENT_WAIT_FOR_UPDATE_MS = 500;

export type ConsentSignal = "granted" | "denied";

export interface ConsentPreferences {
  readonly analytics: boolean;
  readonly advertising: boolean;
}

export interface ConsentModeState {
  readonly ad_storage: ConsentSignal;
  readonly ad_user_data: ConsentSignal;
  readonly ad_personalization: ConsentSignal;
  readonly analytics_storage: ConsentSignal;
  readonly functionality_storage: ConsentSignal;
  readonly security_storage: ConsentSignal;
}

export interface ConsentModeDefault extends ConsentModeState {
  readonly wait_for_update: number;
}

export const DENIED_PREFERENCES: ConsentPreferences = { analytics: false, advertising: false };

const toSignal = (allowed: boolean): ConsentSignal => (allowed ? "granted" : "denied");

export function toConsentModeState(preferences: ConsentPreferences): ConsentModeState {
  const ads = toSignal(preferences.advertising);
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: toSignal(preferences.analytics),
    functionality_storage: "granted",
    security_storage: "granted",
  };
}

export function buildConsentDefault(stored: ConsentPreferences | null): ConsentModeDefault {
  return {
    ...toConsentModeState(stored ?? DENIED_PREFERENCES),
    wait_for_update: CONSENT_WAIT_FOR_UPDATE_MS,
  };
}

export function parseStoredPreferences(raw: string | null): ConsentPreferences | null {
  if (raw === null) {
    return null;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "analytics" in value &&
      "advertising" in value &&
      typeof value.analytics === "boolean" &&
      typeof value.advertising === "boolean"
    ) {
      return { analytics: value.analytics, advertising: value.advertising };
    }
    return null;
  } catch {
    return null;
  }
}

export function serializePreferences(preferences: ConsentPreferences): string {
  return JSON.stringify({ analytics: preferences.analytics, advertising: preferences.advertising });
}
