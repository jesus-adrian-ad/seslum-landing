/**
 * Orquesta una solicitud del formulario de cotización: origen, tipo y tamaño
 * del cuerpo, honeypot, validación, Turnstile y envío por Resend. La Pages
 * Function solo enlaza la petición con este módulo.
 *
 * Las respuestas nunca repiten lo que envió el visitante: solo { ok } o un
 * código de error genérico. El honeypot lleno responde éxito sin enviar nada,
 * para no decirle al bot que lo detectó. El destinatario sale de site.json y el
 * remitente es el subdominio autenticado en Resend.
 */

import servicesJson from "../content/sections/services.json";
import siteJson from "../content/site.json";
import {
  type ContactErrorCode,
  type ContactResponse,
  HONEYPOT_FIELD,
  readSubmission,
  serviceOptions,
  TURNSTILE_ACTION,
  TURNSTILE_RESPONSE_FIELD,
  validateSubmission,
} from "../lib/contact-form";
import { buildContactEmail } from "./contact-email";
import { sendEmail } from "./resend";
import { type FetchLike, verifyTurnstile } from "./turnstile";

export interface ContactEnv {
  readonly RESEND_API_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
}

export const MAX_BODY_BYTES = 16 * 1024;

export const CONTACT_SENDER = "Sitio web Grupo SESLUM <formulario@mail.seslum.com.mx>";

const ALLOWED_SERVICES = serviceOptions(servicesJson);

function respond(status: number, body: ContactResponse): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function fail(status: number, error: ContactErrorCode): Response {
  return respond(status, { ok: false, error });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return false;
  }
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function readBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BODY_BYTES) {
    return null;
  }
  const text = await request.text();
  return new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES ? null : text;
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function honeypotFilled(payload: Record<string, unknown>): boolean {
  const value = payload[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}

export async function handleContactRequest(request: Request, env: ContactEnv, fetchFn: FetchLike): Promise<Response> {
  if (!isSameOrigin(request)) {
    return fail(403, "server");
  }
  if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json")) {
    return fail(415, "server");
  }
  const text = await readBody(request);
  if (text === null) {
    return fail(413, "invalid");
  }
  const payload = parseJson(text);
  if (payload === null) {
    return fail(400, "invalid");
  }
  if (honeypotFilled(payload)) {
    return respond(200, { ok: true });
  }
  const submission = readSubmission(payload);
  const validation = submission ? validateSubmission(submission, ALLOWED_SERVICES) : null;
  if (!validation?.ok) {
    return fail(400, "invalid");
  }
  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    return fail(503, "server");
  }
  const token = payload[TURNSTILE_RESPONSE_FIELD];
  const human = await verifyTurnstile(
    {
      token: typeof token === "string" ? token : "",
      secret: env.TURNSTILE_SECRET_KEY,
      remoteIp: request.headers.get("CF-Connecting-IP"),
      expectedAction: TURNSTILE_ACTION,
    },
    fetchFn,
  );
  if (!human) {
    return fail(403, "captcha");
  }
  const email = buildContactEmail(validation.data, { from: CONTACT_SENDER, to: siteJson.contact.email });
  const delivered = await sendEmail(email, env.RESEND_API_KEY, fetchFn);
  return delivered ? respond(200, { ok: true }) : fail(502, "server");
}
