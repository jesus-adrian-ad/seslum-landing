/**
 * Validación del contenido de Servicios.
 *
 * El JSON llega con los íconos como texto libre; aquí se comprueba que cada uno
 * exista en el catálogo de íconos. Corre durante el build estático, así un
 * nombre mal capturado detiene la publicación en vez de dejar un hueco en la página.
 */

import {
  SERVICE_ICON_NAMES,
  type ServiceIconName,
  type ServiceItem,
  type ServicesContent,
} from "@/types/content";

const KNOWN_ICONS: ReadonlySet<string> = new Set(SERVICE_ICON_NAMES);

export function isServiceIconName(value: string): value is ServiceIconName {
  return KNOWN_ICONS.has(value);
}

function toServiceItem(item: ServiceItem<string>, path: string): ServiceItem {
  if (!isServiceIconName(item.icon)) {
    throw new Error(`Ícono desconocido "${item.icon}" en ${path}. Disponibles: ${SERVICE_ICON_NAMES.join(", ")}.`);
  }
  return { ...item, icon: item.icon };
}

export function parseServicesContent(raw: ServicesContent<string>): ServicesContent {
  return {
    ...raw,
    groups: raw.groups.map((group) => ({
      ...group,
      items: group.items.map((item, index) => toServiceItem(item, `groups.${group.id}.items[${index}]`)),
    })),
    transversal: {
      ...raw.transversal,
      items: raw.transversal.items.map((item, index) => toServiceItem(item, `transversal.items[${index}]`)),
    },
  };
}

