/**
 * Validación del contenido de Sectores durante el build estático.
 *
 * Además del catálogo de íconos, exige al menos un sector e ids únicos: cada id
 * forma los atributos id y aria-controls de su pestaña y su panel, y uno
 * repetido rompería la relación entre ambos sin ningún error visible.
 */

import { assertIconName } from "@/lib/icon-catalog";
import { SECTOR_ICON_NAMES, type SectorsContent } from "@/types/content";

export function parseSectorsContent(raw: SectorsContent<string>): SectorsContent {
  if (raw.sectors.length === 0) {
    throw new Error("Sectores necesita al menos un sector.");
  }
  const seen = new Set<string>();
  for (const sector of raw.sectors) {
    if (seen.has(sector.id)) {
      throw new Error(`El id de sector "${sector.id}" está repetido.`);
    }
    seen.add(sector.id);
  }
  return {
    ...raw,
    sectors: raw.sectors.map((sector, index) => ({
      ...sector,
      icon: assertIconName(SECTOR_ICON_NAMES, sector.icon, `sectors[${index}]`),
    })),
  };
}
