import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { projects } from "@/lib/content";
import { Projects } from "./Projects";

const markup = renderToStaticMarkup(<Projects content={projects} />);
const count = (pattern: RegExp) => markup.match(pattern)?.length ?? 0;

describe("Projects", () => {
  it("abre en el ancla que enlazan el menú y el encabezado", () => {
    expect(markup).toContain('<section id="proyectos"');
    expect(markup).toContain('aria-labelledby="proyectos-title"');
  });

  it("muestra una tarjeta por sector y marca solo la primera como destacada", () => {
    const total = projects.others.length + 1;
    expect(count(/<h3 /g)).toBe(total);
    expect(count(new RegExp(`>${projects.featuredLabel}<`, "g"))).toBe(1);
    expect(markup.indexOf(projects.featuredLabel)).toBeLessThan(markup.indexOf(`>${projects.featured.name}<`));
  });

  it("lista los sistemas de cada tarjeta con su etiqueta accesible", () => {
    const systems = [projects.featured, ...projects.others].reduce((sum, card) => sum + card.systems.length, 0);
    expect(count(new RegExp(`aria-label="${projects.systemsLabel}"`, "g"))).toBe(projects.others.length + 1);
    expect(count(/<li class="[^"]*system[^"]*">/g)).toBe(systems);
  });
});
