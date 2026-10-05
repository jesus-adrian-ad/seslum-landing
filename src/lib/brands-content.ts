/**
 * Validación del contenido de Alianzas comerciales durante el build estático.
 *
 * Solo llevan logo las marcas que dieron su autorización por escrito; las demás
 * van como texto en los grupos. Se exige al menos una alianza con logo, ids
 * únicos, logos servidos desde /images/brands/ con texto alternativo y medidas,
 * y que ninguna marca aparezca a la vez como logo y como texto ni repetida.
 */

import type { BrandsContent } from "@/types/content";

const LOGO_PREFIX = "/images/brands/";

function assertUnique(values: readonly string[], what: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`${what} "${value}" está repetido en Alianzas comerciales.`);
    }
    seen.add(key);
  }
}

export function parseBrandsContent(raw: BrandsContent): BrandsContent {
  if (raw.partners.length === 0) {
    throw new Error("Alianzas comerciales necesita al menos una alianza con logo.");
  }
  assertUnique(
    raw.partners.map((partner) => partner.id),
    "El id de alianza",
  );
  assertUnique(
    raw.alsoGroups.map((group) => group.id),
    "El id de grupo",
  );
  raw.partners.forEach(({ id, logo }, index) => {
    if (!logo.src.startsWith(LOGO_PREFIX)) {
      throw new Error(`El logo de "${id}" (partners[${index}]) debe estar en ${LOGO_PREFIX}.`);
    }
    if (logo.alt.trim() === "" || logo.width <= 0 || logo.height <= 0) {
      throw new Error(`El logo de "${id}" (partners[${index}]) necesita texto alternativo y medidas.`);
    }
  });
  const textBrands = raw.alsoGroups.flatMap((group) => group.brands);
  assertUnique([...raw.partners.map((partner) => partner.id), ...textBrands], "La marca");
  return raw;
}
