import { describe, expect, it } from "vitest";
import type { ServicesContent } from "@/types/content";
import { isServiceIconName, parseServicesContent } from "./services-content";

const minimal: ServicesContent<string> = {
  id: "servicios",
  eyebrow: "Qué hacemos",
  title: "Título",
  lead: "Entrada",
  groups: [{ id: "grupo", title: "Grupo", summary: "Resumen", items: [{ icon: "cctv", name: "A", description: "B" }] }],
  transversal: { title: "Transversal", items: [{ icon: "maintenance", name: "C", description: "D" }] },
};

describe("isServiceIconName", () => {
  it("acepta los íconos del catálogo", () => {
    expect(isServiceIconName("fire-detection")).toBe(true);
  });

  it("rechaza nombres fuera del catálogo", () => {
    expect(isServiceIconName("camara")).toBe(false);
  });
});

describe("parseServicesContent", () => {
  it("conserva el contenido válido", () => {
    expect(parseServicesContent(minimal)).toEqual(minimal);
  });

  it("señala el ícono inválido de un grupo con su ruta", () => {
    const invalid = {
      ...minimal,
      groups: [{ ...minimal.groups[0]!, items: [{ icon: "camara", name: "A", description: "B" }] }],
    };
    expect(() => parseServicesContent(invalid)).toThrow(/"camara" en groups\.grupo\.items\[0\]/);
  });

  it("señala el ícono inválido de los servicios transversales", () => {
    const invalid = { ...minimal, transversal: { title: "T", items: [{ icon: "llave", name: "C", description: "D" }] } };
    expect(() => parseServicesContent(invalid)).toThrow(/transversal\.items\[0\]/);
  });
});

