/**
 * Manifiesto de GTM que se genera en el build estático.
 *
 * Los fragmentos no se renderizan con React: su texto viajaría dos veces en el
 * HTML (en la etiqueta y en el payload de hidratación) y un script en línea desde
 * React exige dangerouslySetInnerHTML. Este archivo lo lee scripts/inline-gtm.mjs,
 * que inserta los fragmentos en cada página y después lo borra de out/.
 */

import { buildEnv, isComingSoon } from "@/lib/env";
import { buildGtmManifest } from "@/lib/gtm-manifest";

export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(buildGtmManifest({ gtmId: buildEnv.gtmId, comingSoon: isComingSoon }));
}
