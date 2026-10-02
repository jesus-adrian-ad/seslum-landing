/**
 * Manifiesto de datos estructurados que se genera en el build estático.
 *
 * El JSON-LD no se renderiza con React: si lo hiciera, su texto viajaría dos
 * veces en el HTML (en la etiqueta y en el payload de hidratación), y ese peso
 * retrasa la carga de la página. Este archivo lo lee
 * scripts/inline-structured-data.mjs, que inserta cada bloque ya escapado en su
 * página y después lo borra de out/.
 */

import { site, faq } from "@/lib/content";
import { buildStructuredDataManifest } from "@/lib/structured-data";

export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(buildStructuredDataManifest(site, faq));
}
