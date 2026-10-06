import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { assertOffices, officesInline, officesSentence } from "./offices";

describe("officesInline y officesSentence", () => {
  const offices = ["Ciudad de México", "Guadalajara", "Tijuana", "Monterrey"];

  it("une las ciudades con punto medio para el pie", () => {
    expect(officesInline(offices)).toBe("Ciudad de México · Guadalajara · Tijuana · Monterrey");
  });

  it("enumera en español con «y» antes de la última", () => {
    expect(officesSentence(offices)).toBe("Ciudad de México, Guadalajara, Tijuana y Monterrey");
  });

  it("con una sola ciudad devuelve solo esa", () => {
    expect(officesSentence(["Monterrey"])).toBe("Monterrey");
  });
});

describe("assertOffices", () => {
  it("acepta las ciudades de site.json", () => {
    expect(() => assertOffices(site.location.offices)).not.toThrow();
  });

  it("rechaza una lista vacía, ciudades vacías o repetidas", () => {
    expect(() => assertOffices([])).toThrow(/al menos una/);
    expect(() => assertOffices(["Monterrey", " "])).toThrow(/vacía/);
    expect(() => assertOffices(["Tijuana", "Tijuana"])).toThrow(/repetidas/);
  });
});
