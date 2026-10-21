/**
 * Manifiesto de instalación de GTM que se genera en el build estático.
 *
 * Reúne lo que scripts/inline-gtm.mjs inserta en cada página: en el `<head>`, el
 * consentimiento por defecto y después el fragmento oficial de Google, que corre al terminar la carga, en tiempo ocioso; al inicio
 * del `<body>`, el `<noscript>`. Con el sitio en construcción o sin un ID
 * válido el manifiesto sale vacío y no se instala nada.
 */

import { buildConsentBootstrapScript } from "@/lib/consent-bootstrap";
import { buildGtmNoscriptHtml, buildGtmDeferredScript, isValidGtmId } from "@/lib/gtm";

export interface GtmManifest {
  readonly headScripts?: readonly string[];
  readonly bodyHtml?: string;
}

export interface GtmManifestInput {
  readonly gtmId: string;
  readonly comingSoon: boolean;
}

export function buildGtmManifest({ gtmId, comingSoon }: GtmManifestInput): GtmManifest {
  if (comingSoon || !isValidGtmId(gtmId)) {
    return {};
  }
  return {
    headScripts: [buildConsentBootstrapScript(), buildGtmDeferredScript(gtmId)],
    bodyHtml: buildGtmNoscriptHtml(gtmId),
  };
}
