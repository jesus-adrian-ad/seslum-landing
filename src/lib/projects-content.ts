/**
 * Validación y armado del contenido de Proyectos durante el build estático.
 *
 * Cada tarjeta referencia un sector por su id y toma de Sectores el nombre y el
 * ícono, así un cambio de nombre se hace en un solo lugar. La primera entrada es
 * el destacado. Se detiene la publicación ante un sector inexistente o repetido,
 * una tarjeta sin sistemas o un sistema vacío o repetido dentro de la misma
 * tarjeta, con la posición exacta del error.
 */

import type { ProjectCard, ProjectsContent, ProjectsSource, SectorsContent } from "@/types/content";

function resolveCard(raw: ProjectsSource["items"][number], index: number, sectors: SectorsContent): ProjectCard {
  const path = `projects.items[${index}]`;
  const sector = sectors.sectors.find((candidate) => candidate.id === raw.sector);
  if (!sector) {
    throw new Error(`El sector "${raw.sector}" de ${path} no existe en Sectores.`);
  }
  if (raw.systems.length === 0) {
    throw new Error(`${path} necesita al menos un sistema.`);
  }
  const systems = raw.systems.map((system) => system.trim());
  systems.forEach((system, systemIndex) => {
    if (system === "") {
      throw new Error(`${path}.systems[${systemIndex}] está vacío.`);
    }
    if (systems.indexOf(system) !== systemIndex) {
      throw new Error(`El sistema "${system}" está repetido en ${path}.`);
    }
  });
  return { id: sector.id, icon: sector.icon, name: sector.name, systems };
}

export function parseProjectsContent(raw: ProjectsSource, sectors: SectorsContent): ProjectsContent {
  const seen = new Set<string>();
  raw.items.forEach((item, index) => {
    if (seen.has(item.sector)) {
      throw new Error(`El sector "${item.sector}" de projects.items[${index}] está repetido.`);
    }
    seen.add(item.sector);
  });
  const [featured, ...others] = raw.items.map((item, index) => resolveCard(item, index, sectors));
  if (!featured) {
    throw new Error("Proyectos necesita al menos un sector.");
  }
  return {
    id: raw.id,
    eyebrow: raw.eyebrow,
    title: raw.title,
    lead: raw.lead,
    featuredLabel: raw.featuredLabel,
    systemsLabel: raw.systemsLabel,
    featured,
    others,
  };
}
