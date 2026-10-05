import { describe, expect, it } from "vitest";
import type { BrandPartner, BrandsContent } from "@/types/content";
import { parseBrandsContent } from "./brands-content";

const partner = (id: string, src = `/images/brands/${id}.svg`): BrandPartner => ({
  id,
  logo: { src, alt: `Logo ${id}`, width: 100, height: 40 },
});

const base: BrandsContent = {
  id: "alianzas",
  eyebrow: "Alianzas comerciales",
  title: "Título",
  lead: "Entrada",
  backing: [{ value: "Garantía", label: "de fábrica" }],
  partnersLabel: "Alianzas vigentes",
  partners: [partner("edwards"), partner("sectrol")],
  alsoTitle: "También trabajamos con",
  alsoGroups: [{ id: "incendio", name: "Incendio", brands: ["NOTIFIER", "Fire-Lite"] }],
};

describe("parseBrandsContent", () => {
  it("conserva el contenido válido", () => {
    expect(parseBrandsContent(base)).toEqual(base);
  });

  it("exige al menos una alianza con logo", () => {
    expect(() => parseBrandsContent({ ...base, partners: [] })).toThrow(/al menos una alianza/);
  });

  it("rechaza ids de alianza repetidos", () => {
    expect(() => parseBrandsContent({ ...base, partners: [partner("edwards"), partner("edwards")] })).toThrow(
      /"edwards" está repetido/,
    );
  });

  it("exige que el logo viva en /images/brands/", () => {
    expect(() => parseBrandsContent({ ...base, partners: [partner("edwards", "https://cdn.example/edwards.svg")] })).toThrow(
      /partners\[0\].*\/images\/brands\//,
    );
  });

  it("exige texto alternativo", () => {
    const sinAlt = { ...partner("edwards"), logo: { ...partner("edwards").logo, alt: " " } };
    expect(() => parseBrandsContent({ ...base, partners: [sinAlt] })).toThrow(/texto alternativo/);
  });

  it("no permite la misma marca como logo y como texto", () => {
    const repetida = { ...base, alsoGroups: [{ id: "incendio", name: "Incendio", brands: ["Edwards"] }] };
    expect(() => parseBrandsContent(repetida)).toThrow(/"Edwards" está repetido/);
  });

  it("no permite una marca repetida entre grupos", () => {
    const repetida = {
      ...base,
      alsoGroups: [
        { id: "a", name: "A", brands: ["Tiandy"] },
        { id: "b", name: "B", brands: ["tiandy"] },
      ],
    };
    expect(() => parseBrandsContent(repetida)).toThrow(/"tiandy" está repetido/);
  });
});
