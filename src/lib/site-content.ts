/**
 * Validación de site.json en el build: hoy revisa la lista de ciudades con
 * atención local, que se muestra en Contacto y en el pie.
 */

import { assertOffices } from "@/lib/offices";
import type { SiteContent } from "@/types/content";

export function parseSiteContent(site: SiteContent): SiteContent {
  assertOffices(site.location.offices);
  return site;
}
