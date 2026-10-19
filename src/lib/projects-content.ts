/**
 * Validación y armado del contenido de Proyectos durante el build estático.
 *
 * Cada línea referencia un servicio por su ícono y toma de Servicios el nombre
 * completo, así un cambio de nombre se hace en un solo lugar; la etiqueta corta
 * de la pestaña vive en Proyectos. Cada línea lleva exactamente cinco fotos: la
 * rejilla está pensada para una grande y cuatro chicas. De cada foto se arman
 * el src (la variante más cercana a 800 px) y el srcset con los anchos que
 * generó scripts/optimize-image.mjs. Se detiene la publicación ante un servicio
 * inexistente o repetido, un archivo con nombre inválido, anchos vacíos o
 * desordenados, medidas que no coinciden con el ancho mayor o un pie vacío, con
 * la posición exacta del error.
 */

import type {
  ProjectPhoto,
  ProjectPhotoSource,
  ProjectService,
  ProjectsContent,
  ProjectsSource,
  ServiceIconName,
  ServiceItem,
  ServicesContent,
} from "@/types/content";

export const PROJECT_PHOTOS_PER_SERVICE = 5;
export const PROJECT_PHOTO_DIR = "/images/proyectos/";
const PREFERRED_SRC_WIDTH = 800;
const FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function photoUrl(file: string, width: number): string {
  return `${PROJECT_PHOTO_DIR}${file}-${width}.webp`;
}

function resolvePhoto(raw: ProjectPhotoSource, path: string): ProjectPhoto {
  if (!FILE_PATTERN.test(raw.file)) {
    throw new Error(`${path}.file "${raw.file}" debe ir en minúsculas, con guiones y sin extensión.`);
  }
  if (raw.widths.length === 0) {
    throw new Error(`${path}.widths está vacío.`);
  }
  raw.widths.forEach((width, index) => {
    if (!Number.isInteger(width) || width <= 0 || (index > 0 && width <= (raw.widths[index - 1] ?? 0))) {
      throw new Error(`${path}.widths debe ir en orden creciente y sin repetir.`);
    }
  });
  const largest = raw.widths[raw.widths.length - 1] ?? 0;
  if (raw.width !== largest || raw.height <= 0) {
    throw new Error(`${path}: width debe ser el ancho mayor (${largest}) y height un número positivo.`);
  }
  const caption = raw.caption.trim();
  if (caption === "") {
    throw new Error(`${path}.caption está vacío.`);
  }
  const srcWidth = raw.widths.find((width) => width >= PREFERRED_SRC_WIDTH) ?? largest;
  return {
    src: photoUrl(raw.file, srcWidth),
    srcSet: raw.widths.map((width) => `${photoUrl(raw.file, width)} ${width}w`).join(", "),
    width: raw.width,
    height: raw.height,
    caption,
  };
}

function serviceItems(services: ServicesContent): readonly ServiceItem[] {
  return [...services.groups.flatMap((group) => group.items), ...services.transversal.items];
}

export function parseProjectsContent(raw: ProjectsSource, services: ServicesContent): ProjectsContent {
  if (raw.services.length === 0) {
    throw new Error("Proyectos necesita al menos una línea de servicio.");
  }
  const catalog = serviceItems(services);
  const seen = new Set<string>();
  const resolved: ProjectService[] = raw.services.map((entry, index) => {
    const path = `projects.services[${index}]`;
    const item = catalog.find((candidate) => candidate.icon === entry.service);
    if (!item) {
      throw new Error(`El servicio "${entry.service}" de ${path} no existe en Servicios.`);
    }
    if (seen.has(entry.service)) {
      throw new Error(`El servicio "${entry.service}" de ${path} está repetido.`);
    }
    seen.add(entry.service);
    if (entry.label.trim() === "") {
      throw new Error(`${path}.label está vacío.`);
    }
    if (entry.photos.length !== PROJECT_PHOTOS_PER_SERVICE) {
      throw new Error(`${path} necesita exactamente ${PROJECT_PHOTOS_PER_SERVICE} fotos (tiene ${entry.photos.length}).`);
    }
    const icon: ServiceIconName = item.icon;
    return {
      id: icon,
      icon,
      label: entry.label.trim(),
      name: item.name,
      photos: entry.photos.map((photo, photoIndex) => resolvePhoto(photo, `${path}.photos[${photoIndex}]`)),
    };
  });
  return {
    id: raw.id,
    eyebrow: raw.eyebrow,
    title: raw.title,
    lead: raw.lead,
    tabsLabel: raw.tabsLabel,
    enlargeHint: raw.enlargeHint,
    lightbox: raw.lightbox,
    services: resolved,
  };
}

export function formatPhotoCounter(template: string, current: number, total: number): string {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}
