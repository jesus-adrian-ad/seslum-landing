/**
 * Arma el correo que recibe ventas con una solicitud del formulario.
 *
 * Remitente propio del subdominio autenticado en Resend (mail.seslum.com.mx):
 * el dominio principal tiene SPF -all y DMARC p=reject, así que nunca se envía
 * "desde" el visitante. Su correo va en reply_to para que responder llegue a él.
 * Todo lo que escribió se escapa antes de entrar al HTML, y el asunto se arma con
 * campos de una sola línea (la validación ya rechaza saltos de línea).
 */

import type { ContactSubmission } from "../lib/contact-form";

export interface OutgoingEmail {
  readonly from: string;
  readonly to: readonly string[];
  readonly reply_to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

export interface EmailAddresses {
  readonly from: string;
  readonly to: string;
}

const SUBJECT_PREFIX = "Solicitud de cotización";
const NOT_PROVIDED = "No lo indicó";
const SUBJECT_NAME_MAX = 60;

const LABELS: ReadonlyArray<readonly [keyof ContactSubmission, string]> = [
  ["name", "Nombre"],
  ["company", "Empresa"],
  ["email", "Correo"],
  ["phone", "Teléfono"],
  ["service", "Servicio de interés"],
];

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

export function buildSubject(data: ContactSubmission): string {
  const name = data.name.slice(0, SUBJECT_NAME_MAX);
  return data.company ? `${SUBJECT_PREFIX}: ${name} (${data.company.slice(0, SUBJECT_NAME_MAX)})` : `${SUBJECT_PREFIX}: ${name}`;
}

function displayValue(data: ContactSubmission, field: keyof ContactSubmission): string {
  return data[field] || NOT_PROVIDED;
}

function buildText(data: ContactSubmission): string {
  const rows = LABELS.map(([field, label]) => `${label}: ${displayValue(data, field)}`);
  return [
    "Nueva solicitud desde el formulario del sitio web.",
    "",
    ...rows,
    "",
    "Mensaje:",
    data.message,
    "",
    "Responda a este correo para contestarle directamente.",
  ].join("\n");
}

function buildHtml(data: ContactSubmission): string {
  const rows = LABELS.map(
    ([field, label]) =>
      `<tr><th align="left" style="padding:4px 12px 4px 0">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(displayValue(data, field))}</td></tr>`,
  ).join("");
  const message = escapeHtml(data.message).replace(/\r?\n/g, "<br>");
  return [
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#142036">',
    "<p>Nueva solicitud desde el formulario del sitio web.</p>",
    `<table cellpadding="0" cellspacing="0">${rows}</table>`,
    `<p><strong>Mensaje:</strong><br>${message}</p>`,
    '<p style="color:#5a6478">Responda a este correo para contestarle directamente.</p>',
    "</div>",
  ].join("");
}

export function buildContactEmail(data: ContactSubmission, addresses: EmailAddresses): OutgoingEmail {
  return {
    from: addresses.from,
    to: [addresses.to],
    reply_to: data.email,
    subject: buildSubject(data),
    text: buildText(data),
    html: buildHtml(data),
  };
}
