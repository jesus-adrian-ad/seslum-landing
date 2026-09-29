import { describe, expect, it } from "vitest";
import type { SectorItem, SectorsContent } from "@/types/content";
import { parseSectorsContent } from "./sectors-content";

const sector = (id: string, icon = "industrial"): SectorItem<string> => ({
  id,
  icon,
  name: "Nombre",
  summary: "Resumen",
  description: "Descripción",
});

const base: SectorsContent<string> = {
  id: "sectores",
  eyebrow: "A quién servimos",
  title: "Título",
  lead: "Entrada",
  tabsLabel: "Sectores",
  sectors: [sector("industrial"), sector("salud", "health")],
};

describe("parseSectorsContent", () => {
  it("conserva el contenido válido", () => {
    expect(parseSectorsContent(base)).toEqual(base);
  });

  it("señala el ícono desconocido con su posición", () => {
    const invalid = { ...base, sectors: [sector("industrial", "fabrica")] };
    expect(() => parseSectorsContent(invalid)).toThrow(/"fabrica" en sectors\[0\]/);
  });

  it("rechaza ids repetidos", () => {
    const invalid = { ...base, sectors: [sector("salud"), sector("salud", "health")] };
    expect(() => parseSectorsContent(invalid)).toThrow(/"salud" está repetido/);
  });

  it("rechaza una lista vacía", () => {
    expect(() => parseSectorsContent({ ...base, sectors: [] })).toThrow(/al menos un sector/);
  });
});
