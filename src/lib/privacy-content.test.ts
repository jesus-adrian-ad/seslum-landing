import { describe, expect, it } from "vitest";
import { privacy } from "@/lib/content";
import { formatUpdated, splitEmails } from "./privacy-content";

describe("formatUpdated", () => {
  it("escribe la fecha en español sin desfase de zona horaria", () => {
    expect(formatUpdated("2026-10-07")).toBe("7 de octubre de 2026");
  });

  it("falla con una fecha inválida", () => {
    expect(() => formatUpdated("ayer")).toThrow(/inválida/);
  });
});

describe("splitEmails", () => {
  it("separa los correos del texto para enlazarlos", () => {
    expect(splitEmails("Escriba a avisoprivacidad@seslum.com.mx indicando:")).toEqual([
      { kind: "text", value: "Escriba a " },
      { kind: "email", value: "avisoprivacidad@seslum.com.mx" },
      { kind: "text", value: " indicando:" },
    ]);
  });

  it("deja igual un texto sin correos", () => {
    expect(splitEmails("Sin correos.")).toEqual([{ kind: "text", value: "Sin correos." }]);
  });
});

describe("privacy.json", () => {
  it("tiene secciones con id único y el correo ARCO", () => {
    const ids = privacy.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(JSON.stringify(privacy)).toContain("avisoprivacidad@seslum.com.mx");
  });
});
