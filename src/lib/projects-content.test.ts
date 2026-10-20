import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projects, services } from "@/lib/content";
import type { ProjectPhotoSource, ProjectServiceSource, ProjectsSource } from "@/types/content";
import { formatPhotoCounter, parseProjectsContent, PROJECT_PHOTOS_PER_SERVICE } from "./projects-content";

const photo = (file: string, overrides: Partial<ProjectPhotoSource> = {}): ProjectPhotoSource => ({
  file,
  widths: [480, 800, 1200],
  width: 1200,
  height: 900,
  caption: `Pie ${file}`,
  ...overrides,
});

const fivePhotos = (prefix: string): ProjectPhotoSource[] =>
  Array.from({ length: PROJECT_PHOTOS_PER_SERVICE }, (_, index) => photo(`${prefix}-${index + 1}`));

const line = (service: string, overrides: Partial<ProjectServiceSource> = {}): ProjectServiceSource => ({
  service,
  label: `Corto ${service}`,
  photos: fivePhotos(service),
  ...overrides,
});

const source = (lines: ProjectServiceSource[]): ProjectsSource => ({
  id: "proyectos",
  eyebrow: "Proyectos",
  title: "Título",
  lead: "Entrada",
  tabsLabel: "Líneas de servicio",
  enlargeHint: "Ampliar foto:",
  lightbox: { previousLabel: "Anterior", nextLabel: "Siguiente", closeLabel: "Cerrar", counter: "{current} de {total}" },
  services: lines,
});

describe("parseProjectsContent", () => {
  it("toma el nombre completo de Servicios y deja la etiqueta corta para la pestaña", () => {
    const [cctv] = parseProjectsContent(source([line("cctv", { label: "Video" })]), services).services;
    expect(cctv?.icon).toBe("cctv");
    expect(cctv?.label).toBe("Video");
    expect(cctv?.name).toBe("Videovigilancia");
  });

  it("arma src con la variante de 800 px y srcset con todos los anchos", () => {
    const [cctv] = parseProjectsContent(source([line("cctv")]), services).services;
    expect(cctv?.photos[0]?.src).toBe("/images/proyectos/cctv-1-800.webp");
    expect(cctv?.photos[0]?.srcSet).toBe(
      "/images/proyectos/cctv-1-480.webp 480w, /images/proyectos/cctv-1-800.webp 800w, /images/proyectos/cctv-1-1200.webp 1200w",
    );
  });

  it("usa el ancho mayor como src cuando la foto no llega a 800 px", () => {
    const photos = fivePhotos("cctv");
    photos[0] = photo("chica", { widths: [357], width: 357, height: 474 });
    const [cctv] = parseProjectsContent(source([line("cctv", { photos })]), services).services;
    expect(cctv?.photos[0]?.src).toBe("/images/proyectos/chica-357.webp");
  });

  it("rechaza un servicio que no existe o que se repite", () => {
    expect(() => parseProjectsContent(source([line("cocina")]), services)).toThrow(/"cocina" de projects\.services\[0\] no existe/);
    expect(() => parseProjectsContent(source([line("cctv"), line("cctv")]), services)).toThrow(/projects\.services\[1\] está repetido/);
  });

  it("exige exactamente cinco fotos por línea", () => {
    const photos = fivePhotos("cctv").slice(0, 4);
    expect(() => parseProjectsContent(source([line("cctv", { photos })]), services)).toThrow(/exactamente 5 fotos \(tiene 4\)/);
  });

  it.each([
    ["un nombre de archivo con extensión", { file: "foto.jpg" }, /file "foto\.jpg"/],
    ["anchos desordenados", { widths: [800, 480], width: 480 }, /orden creciente/],
    ["un ancho que no es el mayor", { width: 800 }, /ancho mayor \(1200\)/],
    ["un pie vacío", { caption: "  " }, /caption está vacío/],
  ])("rechaza %s con la ruta exacta", (_label, overrides, message) => {
    const photos = fivePhotos("cctv");
    photos[2] = photo("cctv-3", overrides);
    expect(() => parseProjectsContent(source([line("cctv", { photos })]), services)).toThrow(message);
    expect(() => parseProjectsContent(source([line("cctv", { photos })]), services)).toThrow(/projects\.services\[0\]\.photos\[2\]/);
  });
});

describe("contenido publicado de Proyectos", () => {
  it("cubre las seis líneas de servicio, con cinco fotos cada una", () => {
    expect(projects.services.map((service) => service.icon)).toEqual([
      "cctv",
      "access-control",
      "fire-detection",
      "fire-suppression",
      "structured-cabling",
      "electrical",
    ]);
    projects.services.forEach((service) => expect(service.photos).toHaveLength(PROJECT_PHOTOS_PER_SERVICE));
  });

  it("solo referencia variantes que existen en public/", () => {
    const missing = projects.services
      .flatMap((service) => service.photos)
      .flatMap((entry) => entry.srcSet.split(", ").map((candidate) => candidate.split(" ")[0] ?? ""))
      .filter((url) => !existsSync(path.join(process.cwd(), "public", url)));
    expect(missing).toEqual([]);
  });
});

describe("formatPhotoCounter", () => {
  it("rellena la posición y el total", () => {
    expect(formatPhotoCounter("{current} de {total}", 3, 5)).toBe("3 de 5");
  });
});
