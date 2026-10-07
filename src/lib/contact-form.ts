/**
 * Reglas del formulario de cotización, compartidas por el navegador y la Pages
 * Function: los mismos campos, límites y validaciones en los dos lados.
 *
 * En el navegador sirven para avisar al visitante antes de enviar; en el
 * servidor son la defensa real, porque cualquiera puede llamar al endpoint sin
 * pasar por la página. No se "limpia" lo que no cuadra: se rechaza. Los valores
 * válidos solo se recortan de espacios en los extremos.
 *
 * Solo usa imports relativos o de tipo para que el bundler de la Function
 * (esbuild de wrangler) lo resuelva sin alias.
 */

import type { ServicesContent } from "../types/content";

export const CONTACT_FIELDS = ["name", "company", "email", "phone", "service", "message"] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactSubmission = Readonly<Record<ContactField, string>>;

export type FieldErrorCode = "required" | "tooShort" | "tooLong" | "invalid";

export type FieldErrors = Partial<Record<ContactField, FieldErrorCode>>;

export type ValidationResult =
  | { readonly ok: true; readonly data: ContactSubmission }
  | { readonly ok: false; readonly errors: FieldErrors };

interface FieldRule {
  readonly required: boolean;
  readonly min: number;
  readonly max: number;
}

export const FIELD_RULES: Readonly<Record<ContactField, FieldRule>> = {
  name: { required: true, min: 2, max: 80 },
  company: { required: false, min: 0, max: 100 },
  email: { required: true, min: 6, max: 254 },
  phone: { required: false, min: 0, max: 25 },
  service: { required: false, min: 0, max: 80 },
  message: { required: true, min: 10, max: 2000 },
};

export const HONEYPOT_FIELD = "website";

export const TURNSTILE_RESPONSE_FIELD = "turnstileToken";

export const TURNSTILE_ACTION = "contact";

export const OTHER_SERVICE = "Otro / varios";

export const CONTACT_ENDPOINT = "/api/contact";

export type ContactErrorCode = "invalid" | "captcha" | "server";

export type ContactResponse = { readonly ok: true } | { readonly ok: false; readonly error: ContactErrorCode };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9 ()\-.]+$/;
const MIN_PHONE_DIGITS = 8;
const LINE_BREAK = /[\r\n]/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const SINGLE_LINE_FIELDS: readonly ContactField[] = ["name", "company", "email", "phone", "service"];

export function serviceOptions(services: ServicesContent<string>): readonly string[] {
  const lines = services.groups.flatMap((group) => group.items.map((item) => item.name));
  const transversal = services.transversal.items.map((item) => item.name);
  return [...lines, ...transversal, OTHER_SERVICE];
}

export function emptySubmission(): ContactSubmission {
  return { name: "", company: "", email: "", phone: "", service: "", message: "" };
}

export function readSubmission(raw: unknown): ContactSubmission | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const values = emptySubmission() as Record<ContactField, string>;
  for (const field of CONTACT_FIELDS) {
    const value = record[field] ?? "";
    if (typeof value !== "string") {
      return null;
    }
    values[field] = value;
  }
  return values;
}

function checkFormat(field: ContactField, value: string, allowedServices: readonly string[]): FieldErrorCode | null {
  if (CONTROL_CHARACTERS.test(value) || (SINGLE_LINE_FIELDS.includes(field) && LINE_BREAK.test(value))) {
    return "invalid";
  }
  switch (field) {
    case "email":
      return EMAIL_PATTERN.test(value) ? null : "invalid";
    case "phone": {
      const digits = value.replace(/\D/g, "").length;
      return PHONE_PATTERN.test(value) && digits >= MIN_PHONE_DIGITS ? null : "invalid";
    }
    case "service":
      return allowedServices.includes(value) ? null : "invalid";
    default:
      return null;
  }
}

function checkField(field: ContactField, value: string, allowedServices: readonly string[]): FieldErrorCode | null {
  const rule = FIELD_RULES[field];
  if (value === "") {
    return rule.required ? "required" : null;
  }
  if (value.length > rule.max) {
    return "tooLong";
  }
  if (value.length < rule.min) {
    return "tooShort";
  }
  return checkFormat(field, value, allowedServices);
}

export function validateSubmission(input: ContactSubmission, allowedServices: readonly string[]): ValidationResult {
  const data = emptySubmission() as Record<ContactField, string>;
  const errors: FieldErrors = {};
  for (const field of CONTACT_FIELDS) {
    const value = input[field].trim();
    const error = checkField(field, value, allowedServices);
    if (error) {
      errors[field] = error;
    }
    data[field] = value;
  }
  return Object.keys(errors).length === 0 ? { ok: true, data } : { ok: false, errors };
}

export function firstInvalidField(errors: FieldErrors): ContactField | null {
  return CONTACT_FIELDS.find((field) => errors[field] !== undefined) ?? null;
}
