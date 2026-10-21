/**
 * Validación de site.json en el build: revisa la lista de ciudades con atención
 * local, que se muestra en Contacto y en el pie junto con la matriz
 * (location.locality), que no debe repetirse en esa lista, y la conversión de
 * llamadas de Google Ads, que puede ir vacía (null) pero nunca mal formada.
 */

import { isValidPhoneConversion } from "@/lib/google-ads";
import { assertOffices } from "@/lib/offices";
import type { SiteContent } from "@/types/content";

export function parseSiteContent(site: SiteContent): SiteContent {
  assertOffices(site.location.offices, site.location.locality);
  const { phoneConversion } = site.googleAds;
  if (phoneConversion !== null && !isValidPhoneConversion(phoneConversion)) {
    throw new Error(`site.json: googleAds.phoneConversion inválida: ${JSON.stringify(phoneConversion)}`);
  }
  return site;
}
