import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { projects } from "@/lib/content";
import { Projects } from "./Projects";

const markup = renderToStaticMarkup(<Projects content={projects} />);
const count = (pattern: RegExp) => markup.match(pattern)?.length ?? 0;
const photos = projects.services.flatMap((service) => service.photos);

describe("Projects", () => {
  it("abre en el ancla que enlazan el menú y el encabezado", () => {
    expect(markup).toContain('<section id="proyectos"');
    expect(markup).toContain('aria-labelledby="proyectos-title"');
  });

  it("tiene una pestaña por línea de servicio y solo la primera seleccionada", () => {
    expect(count(/role="tab"/g)).toBe(projects.services.length);
    expect(count(/aria-selected="true"/g)).toBe(1);
    expect(markup).toContain(`aria-label="${projects.tabsLabel}"`);
    projects.services.forEach((service) => {
      expect(markup).toContain(`aria-controls="proyectos-panel-${service.id}"`);
      expect(markup).toContain(`>${service.label}</span>`);
    });
  });

  it("deja todos los paneles en el HTML y oculta los que no están activos", () => {
    expect(count(/role="tabpanel"/g)).toBe(projects.services.length);
    expect(count(/<div[^>]*role="tabpanel"[^>]*hidden=""/g)).toBe(projects.services.length - 1);
    projects.services.forEach((service) => expect(markup).toContain(`>${service.name}</h3>`));
  });

  it("carga las fotos en diferido, sin precargar ninguna, con su pie como nombre del botón", () => {
    expect(count(/<img [^>]*loading="lazy"/g)).toBe(photos.length);
    expect(markup).not.toContain('rel="preload"');
    expect(count(/aria-haspopup="dialog"/g)).toBe(photos.length);
    photos.forEach((photo) => expect(markup).toContain(`${photo.caption}</span>`));
  });

  it("no pide ninguna imagen para la ventana hasta abrirla", () => {
    expect(markup).toMatch(/<dialog [^>]*>\s*<figure[^>]*><\/figure><\/dialog>/);
  });
});
