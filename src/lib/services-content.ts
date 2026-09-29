/**
 * Validación del contenido de Servicios: cada ícono debe existir en su catálogo.
 * Corre durante el build estático (ver icon-catalog.ts).
 */

import { assertIconName, isInCatalog } from "@/lib/icon-catalog";
import {
  SERVICE_ICON_NAMES,
  type ServiceIconName,
  type ServiceItem,
  type ServicesContent,
} from "@/types/content";

export function isServiceIconName(value: string): value is ServiceIconName {
  return isInCatalog(SERVICE_ICON_NAMES, value);
}

function toServiceItem(item: ServiceItem<string>, path: string): ServiceItem {
  return { ...item, icon: assertIconName(SERVICE_ICON_NAMES, item.icon, path) };
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
