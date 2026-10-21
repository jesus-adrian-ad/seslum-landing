/**
 * Manifiesto de instalación de GTM que se genera en el build estático.
 *
 * Reúne lo que scripts/inline-gtm.mjs inserta en cada página: en el `<head>`, el
 * consentimiento por defecto, después el fragmento oficial de Google, que corre al
 * terminar la carga, en tiempo ocioso, y al final, si hay conversión configurada,
 * el fragmento de llamadas de Google Ads que va después de la etiqueta de Google;
 * al inicio del `<body>`, el `<noscript>`. Con el sitio en construcción o sin un ID
 * válido el manifiesto sale vacío y no se instala nada: sin GTM no hay etiqueta de
 * Google que procese la conversión.
 */

import { buildConsentBootstrapScript } from "@/lib/consent-bootstrap";
import { buildPhoneConversionScript, type PhoneConversion } from "@/lib/google-ads";
import { buildGtmNoscriptHtml, buildGtmDeferredScript, isValidGtmId } from "@/lib/gtm";

export interface GtmManifest {
  readonly headScripts?: readonly string[];
  readonly bodyHtml?: string;
}

export interface GtmManifestInput {
  readonly gtmId: string;
  readonly comingSoon: boolean;
  readonly phoneConversion?: PhoneConversion | null;
}

export function buildGtmManifest({ gtmId, comingSoon, phoneConversion = null }: GtmManifestInput): GtmManifest {
  if (comingSoon || !isValidGtmId(gtmId)) {
    return {};
  }
  const headScripts = [buildConsentBootstrapScript(), buildGtmDeferredScript(gtmId)];
  if (phoneConversion !== null) {
    headScripts.push(buildPhoneConversionScript(phoneConversion));
  }
  return {
    headScripts,
    bodyHtml: buildGtmNoscriptHtml(gtmId),
  };
}
