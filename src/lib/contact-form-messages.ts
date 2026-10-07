/**
 * Textos del formulario según el estado: el mensaje de error de cada campo
 * (con el específico del campo si existe y el genérico si no), la línea de
 * estado bajo el botón y el estado que corresponde a una respuesta fallida del
 * servidor (cualquier código desconocido cuenta como error de servidor).
 */

import type { ContactField, FieldErrorCode } from "@/lib/contact-form";
import type { ContactFormContent } from "@/types/content";

export type FormStatus = "idle" | "sending" | "success" | "invalid" | "verifying" | "captcha" | "server";

export function fieldErrorMessage(content: ContactFormContent, field: ContactField, code: FieldErrorCode): string {
  return content.fieldErrors[field]?.[code] ?? content.errors[code];
}

export function statusMessage(content: ContactFormContent, status: FormStatus): string {
  switch (status) {
    case "invalid":
    case "verifying":
    case "captcha":
    case "server":
      return content.status[status];
    default:
      return "";
  }
}

const FAILURE_STATUSES: readonly FormStatus[] = ["invalid", "captcha", "server"];

export function failureStatus(error: unknown): FormStatus {
  return FAILURE_STATUSES.find((status) => status === error) ?? "server";
}
