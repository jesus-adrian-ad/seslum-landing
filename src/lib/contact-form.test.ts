import { describe, expect, it } from "vitest";
import { services } from "@/lib/content";
import {
  type ContactSubmission,
  emptySubmission,
  FIELD_RULES,
  firstInvalidField,
  OTHER_SERVICE,
  readSubmission,
  serviceOptions,
  validateSubmission,
} from "./contact-form";

const allowed = serviceOptions(services);

const valid: ContactSubmission = {
  name: "Ana López",
  company: "Industrias del Norte",
  email: "ana@industrias.mx",
  phone: "+52 81 1234 5678",
  service: "Videovigilancia",
  message: "Necesitamos cámaras para una nave de 3,000 m².",
};

const withValue = (field: keyof ContactSubmission, value: string): ContactSubmission => ({ ...valid, [field]: value });

describe("serviceOptions", () => {
  it("lista las 10 capacidades de services.json y cierra con «Otro»", () => {
    expect(allowed).toHaveLength(11);
    expect(allowed[0]).toBe("Videovigilancia");
    expect(allowed.at(-1)).toBe(OTHER_SERVICE);
    expect(new Set(allowed).size).toBe(allowed.length);
  });
});

describe("readSubmission", () => {
  it("lee los seis campos y deja vacíos los que faltan", () => {
    expect(readSubmission({ name: "Ana" })).toEqual({ ...emptySubmission(), name: "Ana" });
  });

  it("rechaza lo que no es objeto o trae campos que no son texto", () => {
    expect(readSubmission(null)).toBeNull();
    expect(readSubmission("hola")).toBeNull();
    expect(readSubmission({ name: ["Ana"] })).toBeNull();
  });
});

describe("validateSubmission", () => {
  it("acepta una solicitud completa y recorta espacios", () => {
    const result = validateSubmission({ ...valid, name: "  Ana López  " }, allowed);
    expect(result).toEqual({ ok: true, data: valid });
  });

  it("solo exige nombre, correo y mensaje", () => {
    const result = validateSubmission({ ...valid, company: "", phone: "", service: "" }, allowed);
    expect(result.ok).toBe(true);
    const empty = validateSubmission(emptySubmission(), allowed);
    expect(empty).toEqual({ ok: false, errors: { name: "required", email: "required", message: "required" } });
  });

  it("valida longitudes mínimas y máximas", () => {
    expect(validateSubmission(withValue("name", "A"), allowed)).toEqual({ ok: false, errors: { name: "tooShort" } });
    expect(validateSubmission(withValue("message", "Hola"), allowed)).toEqual({ ok: false, errors: { message: "tooShort" } });
    const long = "x".repeat(FIELD_RULES.message.max + 1);
    expect(validateSubmission(withValue("message", long), allowed)).toEqual({ ok: false, errors: { message: "tooLong" } });
  });

  it("rechaza correos y teléfonos mal formados", () => {
    expect(validateSubmission(withValue("email", "ana@industrias"), allowed)).toEqual({ ok: false, errors: { email: "invalid" } });
    expect(validateSubmission(withValue("phone", "81-ABC-1234"), allowed)).toEqual({ ok: false, errors: { phone: "invalid" } });
    expect(validateSubmission(withValue("phone", "1234"), allowed)).toEqual({ ok: false, errors: { phone: "invalid" } });
  });

  it("rechaza saltos de línea en campos de una línea (inyección de cabeceras)", () => {
    const injected = withValue("email", "ana@industrias.mx\r\nBcc: spam@otro.com");
    expect(validateSubmission(injected, allowed)).toEqual({ ok: false, errors: { email: "invalid" } });
    expect(validateSubmission(withValue("name", "Ana\nLópez"), allowed)).toEqual({ ok: false, errors: { name: "invalid" } });
  });

  it("permite saltos de línea en el mensaje, pero no caracteres de control", () => {
    expect(validateSubmission(withValue("message", "Primera línea\nSegunda línea"), allowed).ok).toBe(true);
    expect(validateSubmission(withValue("message", "Mensaje con \u0007 campana"), allowed)).toEqual({
      ok: false,
      errors: { message: "invalid" },
    });
  });

  it("solo acepta servicios de la lista", () => {
    expect(validateSubmission(withValue("service", "Hackeo"), allowed)).toEqual({ ok: false, errors: { service: "invalid" } });
    expect(validateSubmission(withValue("service", OTHER_SERVICE), allowed).ok).toBe(true);
  });
});

describe("firstInvalidField", () => {
  it("devuelve el primer campo con error en el orden del formulario", () => {
    expect(firstInvalidField({ message: "required", email: "invalid" })).toBe("email");
    expect(firstInvalidField({})).toBeNull();
  });
});
