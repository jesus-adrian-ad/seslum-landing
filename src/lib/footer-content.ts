/**
 * Datos derivados que muestra el pie de página.
 *
 * El pie no repite contenido: toma los enlaces del navbar, las líneas de
 * servicio de services.json y los datos de contacto de site.json, así un cambio
 * en cualquiera de ellos llega aquí sin tocar el pie.
 */

import type { ServicesContent } from "@/types/content";

export interface FooterServiceLink {
  readonly label: string;
  readonly href: string;
}

export function footerServiceLinks(services: ServicesContent): FooterServiceLink[] {
  const href = `#${services.id}`;
  return services.groups.flatMap((group) => group.items.map((item) => ({ label: item.name, href })));
}

export function copyrightLine(year: number, name: string, rights: string): string {
  return `© ${year} ${name}. ${rights}`;
}
