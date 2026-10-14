import { describe, expect, it } from "vitest";
import { projects, sectors } from "@/lib/content";
import type { ProjectsSource } from "@/types/content";
import { parseProjectsContent } from "./projects-content";

const base: ProjectsSource = {
  id: "proyectos",
  eyebrow: "Proyectos",
  title: "Título",
  lead: "Entrada",
  featuredLabel: "Destacado",
  systemsLabel: "Sistemas instalados",
  items: [
    { sector: "industrial", systems: ["Videovigilancia", "Extinción"] },
    { sector: "salud", systems: ["Detección por aspiración"] },
  ],
};

const withItems = (items: ProjectsSource["items"]): ProjectsSource => ({ ...base, items });

describe("parseProjectsContent", () => {
  it("toma nombre e ícono de Sectores y usa la primera entrada como destacado", () => {
    const parsed = parseProjectsContent(base, sectors);
    expect(parsed.featured).toEqual({
      id: "industrial",
      icon: "industrial",
      name: "Industrial",
      systems: ["Videovigilancia", "Extinción"],
    });
    expect(parsed.others.map((card) => card.name)).toEqual(["Salud"]);
  });

  it("publica un sector por tarjeta, en el orden de Sectores", () => {
    const order = [projects.featured, ...projects.others].map((card) => card.id);
    expect(order).toEqual(sectors.sectors.map((sector) => sector.id));
  });

  it("rechaza un sector que no existe en Sectores", () => {
    expect(() => parseProjectsContent(withItems([{ sector: "minero", systems: ["Extinción"] }]), sectors)).toThrow(
      /"minero" de projects\.items\[0\] no existe/,
    );
  });

  it("rechaza un sector repetido", () => {
    const repeated = withItems([...base.items, { sector: "salud", systems: ["Extinción"] }]);
    expect(() => parseProjectsContent(repeated, sectors)).toThrow(/"salud" de projects\.items\[2\] está repetido/);
  });

  it("exige sistemas no vacíos y sin repetir dentro de una tarjeta", () => {
    expect(() => parseProjectsContent(withItems([{ sector: "salud", systems: [] }]), sectors)).toThrow(
      /items\[0\] necesita al menos un sistema/,
    );
    expect(() => parseProjectsContent(withItems([{ sector: "salud", systems: ["  "] }]), sectors)).toThrow(
      /items\[0\]\.systems\[0\] está vacío/,
    );
    expect(() =>
      parseProjectsContent(withItems([{ sector: "salud", systems: ["Extinción", "Extinción "] }]), sectors),
    ).toThrow(/"Extinción" está repetido/);
  });

  it("rechaza una lista vacía", () => {
    expect(() => parseProjectsContent(withItems([]), sectors)).toThrow(/al menos un sector/);
  });
});
