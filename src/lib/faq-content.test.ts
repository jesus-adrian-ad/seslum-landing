import { describe, expect, it } from "vitest";
import type { FaqContent, FaqItem } from "@/types/content";
import { parseFaqContent } from "./faq-content";

const item = (id: string, question = "¿Pregunta?", answer = "Respuesta."): FaqItem => ({ id, question, answer });

const base: FaqContent = {
  id: "faq",
  eyebrow: "Preguntas frecuentes",
  title: "Título",
  lead: "Entrada",
  items: [item("uno"), item("dos")],
};

describe("parseFaqContent", () => {
  it("conserva el contenido válido", () => {
    expect(parseFaqContent(base)).toEqual(base);
  });

  it("rechaza una lista vacía", () => {
    expect(() => parseFaqContent({ ...base, items: [] })).toThrow(/al menos una pregunta/);
  });

  it("rechaza ids repetidos", () => {
    expect(() => parseFaqContent({ ...base, items: [item("uno"), item("uno")] })).toThrow(/"uno" está repetido/);
  });

  it("señala la pregunta vacía con su posición", () => {
    expect(() => parseFaqContent({ ...base, items: [item("uno"), item("dos", "  ")] })).toThrow(/items\[1\]/);
  });

  it("señala la respuesta vacía con su posición", () => {
    expect(() => parseFaqContent({ ...base, items: [item("uno", "¿Pregunta?", "")] })).toThrow(/items\[0\]/);
  });
});
