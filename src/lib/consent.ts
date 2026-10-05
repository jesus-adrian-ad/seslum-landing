/**
 * Preferencias de consentimiento de cookies y su traducción a Consent Mode v2.
 *
 * Lógica pura: no toca el DOM ni el almacenamiento. Por defecto todo lo que no es
 * estrictamente necesario queda denegado hasta que el visitante decida, y la
 * decisión se guarda con su fecha para volver a preguntar a los 12 meses. Una
 * decisión mal formada, con fecha futura o vencida se trata como inexistente.
 */

export const CONSENT_STORAGE_KEY = "seslum.consent.v1";

export const CONSENT_WAIT_FOR_UPDATE_MS = 500;

export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

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

export const ACCEPTED_PREFERENCES: ConsentPreferences = { analytics: true, advertising: true };

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

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseStoredConsent(raw: string | null, now: number): ConsentPreferences | null {
  if (raw === null) {
    return null;
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    typeof value.analytics !== "boolean" ||
    typeof value.advertising !== "boolean" ||
    typeof value.decidedAt !== "number" ||
    !Number.isFinite(value.decidedAt)
  ) {
    return null;
  }
  const age = now - value.decidedAt;
  if (age < 0 || age > CONSENT_MAX_AGE_MS) {
    return null;
  }
  return { analytics: value.analytics, advertising: value.advertising };
}

export function serializeConsent(preferences: ConsentPreferences, decidedAt: number): string {
  return JSON.stringify({ analytics: preferences.analytics, advertising: preferences.advertising, decidedAt });
}
