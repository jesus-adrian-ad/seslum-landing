/**
 * Script en línea que declara el consentimiento por defecto antes del fragmento
 * de GTM.
 *
 * Corre en el `<head>`, antes de React, así que no puede importar módulos: lee la
 * decisión guardada con las mismas reglas que parseStoredConsent (llave, forma y
 * vigencia de 12 meses) y elige uno de los cuatro estados que buildConsentDefault
 * calcula en el build. El mapeo a Consent Mode vive solo en consent.ts; la prueba
 * de equivalencia compara este script contra parseStoredConsent. Consent Mode solo
 * reconoce comandos publicados como objeto `arguments`.
 */

import {
  buildConsentDefault,
  CONSENT_MAX_AGE_MS,
  CONSENT_STORAGE_KEY,
  type ConsentModeDefault,
} from "@/lib/consent";

type ConsentDefaultTable = Readonly<Record<"00" | "01" | "10" | "11", ConsentModeDefault>>;

function buildDefaultTable(): ConsentDefaultTable {
  return {
    "00": buildConsentDefault(null),
    "01": buildConsentDefault({ analytics: false, advertising: true }),
    "10": buildConsentDefault({ analytics: true, advertising: false }),
    "11": buildConsentDefault({ analytics: true, advertising: true }),
  };
}

export function buildConsentBootstrapScript(): string {
  const key = JSON.stringify(CONSENT_STORAGE_KEY);
  const table = JSON.stringify(buildDefaultTable());
  return `(function(w,k,m,t){w.dataLayer=w.dataLayer||[];function g(){w.dataLayer.push(arguments);}var c="00";try{var v=JSON.parse(w.localStorage.getItem(k));if(v&&typeof v==="object"&&!Array.isArray(v)&&typeof v.analytics==="boolean"&&typeof v.advertising==="boolean"&&typeof v.decidedAt==="number"&&isFinite(v.decidedAt)){var a=Date.now()-v.decidedAt;if(a>=0&&a<=m){c=(v.analytics?"1":"0")+(v.advertising?"1":"0");}}}catch(e){}g("consent","default",t[c]);})(window,${key},${CONSENT_MAX_AGE_MS},${table});`;
}
