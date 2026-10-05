/**
 * Lado del navegador del consentimiento: lee y guarda la decisión y la publica
 * en el dataLayer con Consent Mode v2.
 *
 * Lo comparten TagManager (consentimiento por defecto) y el banner (actualización).
 * El almacenamiento puede fallar (modo privado, cookies bloqueadas): en ese caso
 * la decisión vale solo para esta visita y el sitio sigue funcionando. Consent
 * Mode solo reconoce los comandos publicados como objeto `arguments`; con un
 * arreglo los ignora sin avisar (ver la excepción en el README). Los controles
 * con CONSENT_OPEN_ATTRIBUTE, como el enlace del pie, vuelven a abrir las
 * preferencias.
 */

import { ANALYTICS_EVENTS, ensureDataLayer } from "@/lib/analytics";
import {
  CONSENT_STORAGE_KEY,
  type ConsentPreferences,
  parseStoredConsent,
  serializeConsent,
  toConsentModeState,
} from "@/lib/consent";

type ConsentCommand = (command: "consent", action: "default" | "update", state: object) => void;

export const CONSENT_OPEN_ATTRIBUTE = "data-consent-open";

export const pushConsentCommand: ConsentCommand = function pushConsentCommand() {
  ensureDataLayer(window).push(arguments);
};

export function readStoredConsent(now: number = Date.now()): ConsentPreferences | null {
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY), now);
  } catch {
    return null;
  }
}

function persistConsent(preferences: ConsentPreferences, now: number): boolean {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsent(preferences, now));
    return true;
  } catch {
    return false;
  }
}

export function saveConsent(preferences: ConsentPreferences, now: number = Date.now()): void {
  persistConsent(preferences, now);
  pushConsentCommand("consent", "update", toConsentModeState(preferences));
  ensureDataLayer(window).push({
    event: ANALYTICS_EVENTS.consentUpdate,
    analytics: preferences.analytics,
    advertising: preferences.advertising,
  });
}
