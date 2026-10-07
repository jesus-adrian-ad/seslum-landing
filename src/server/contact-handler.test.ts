import { describe, expect, it, vi } from "vitest";
import { TURNSTILE_ACTION } from "@/lib/contact-form";
import { type ContactEnv, handleContactRequest, MAX_BODY_BYTES } from "./contact-handler";
import { RESEND_EMAILS_URL } from "./resend";
import { SITEVERIFY_URL, verifyTurnstile } from "./turnstile";

const ORIGIN = "https://seslum.com.mx";
const FAKE_CREDENTIAL = "credencial-de-prueba";
const env: ContactEnv = { RESEND_API_KEY: FAKE_CREDENTIAL, TURNSTILE_SECRET_KEY: FAKE_CREDENTIAL };

const validBody = {
  name: "Ana López",
  company: "",
  email: "ana@industrias.mx",
  phone: "",
  service: "Videovigilancia",
  message: "Necesitamos cámaras para una nave industrial.",
  website: "",
  turnstileToken: "token-valido",
};

interface RequestOptions {
  readonly body?: string;
  readonly origin?: string | null;
  readonly contentType?: string;
}

function makeRequest({ body = JSON.stringify(validBody), origin = ORIGIN, contentType = "application/json" }: RequestOptions = {}) {
  const headers = new Headers({ "Content-Type": contentType, "CF-Connecting-IP": "203.0.113.7" });
  if (origin) headers.set("Origin", origin);
  return new Request(`${ORIGIN}/api/contact`, { method: "POST", headers, body });
}

function fakeFetch(options: { human?: boolean; action?: string; delivered?: boolean } = {}) {
  const { human = true, action = TURNSTILE_ACTION, delivered = true } = options;
  return vi.fn(async (url: string) => {
    if (url === SITEVERIFY_URL) return Response.json({ success: human, action });
    if (url === RESEND_EMAILS_URL) return new Response("{}", { status: delivered ? 200 : 500 });
    throw new Error(`URL inesperada: ${url}`);
  });
}

async function call(request: Request, fetchFn = fakeFetch(), environment: ContactEnv = env) {
  const response = await handleContactRequest(request, environment, fetchFn);
  return { status: response.status, body: (await response.json()) as unknown, fetchFn, response };
}

describe("handleContactRequest", () => {
  it("verifica Turnstile, envía el correo y responde ok", async () => {
    const { status, body, fetchFn, response } = await call(makeRequest());
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([SITEVERIFY_URL, RESEND_EMAILS_URL]);
    const [, init] = fetchFn.mock.calls[1] as unknown as [string, RequestInit];
    const sent = JSON.parse(String(init.body)) as { to: string[]; reply_to: string };
    expect(sent.to).toEqual(["ventas@seslum.com.mx"]);
    expect(sent.reply_to).toBe("ana@industrias.mx");
  });

  it("rechaza peticiones de otro origen o sin origen", async () => {
    expect((await call(makeRequest({ origin: "https://otro-sitio.com" }))).status).toBe(403);
    expect((await call(makeRequest({ origin: null }))).status).toBe(403);
  });

  it("rechaza cuerpos que no son JSON o que exceden el límite", async () => {
    expect((await call(makeRequest({ contentType: "text/plain" }))).status).toBe(415);
    expect((await call(makeRequest({ body: "{no es json" }))).status).toBe(400);
    expect((await call(makeRequest({ body: "[]" }))).status).toBe(400);
    const huge = JSON.stringify({ ...validBody, message: "x".repeat(MAX_BODY_BYTES) });
    expect((await call(makeRequest({ body: huge }))).status).toBe(413);
  });

  it("con el honeypot lleno responde ok sin verificar ni enviar", async () => {
    const { status, body, fetchFn } = await call(makeRequest({ body: JSON.stringify({ ...validBody, website: "https://spam.example" }) }));
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("rechaza datos inválidos sin repetir lo que se envió", async () => {
    const { status, body, fetchFn } = await call(makeRequest({ body: JSON.stringify({ ...validBody, email: "no-es-correo" }) }));
    expect(status).toBe(400);
    expect(body).toEqual({ ok: false, error: "invalid" });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("rechaza si Turnstile no confirma o el token es de otra acción", async () => {
    expect((await call(makeRequest(), fakeFetch({ human: false }))).body).toEqual({ ok: false, error: "captcha" });
    expect((await call(makeRequest(), fakeFetch({ action: "login" }))).status).toBe(403);
  });

  it("falla cerrado si faltan los secretos o Resend no entrega", async () => {
    expect((await call(makeRequest(), fakeFetch(), {})).status).toBe(503);
    const { status, body } = await call(makeRequest(), fakeFetch({ delivered: false }));
    expect(status).toBe(502);
    expect(body).toEqual({ ok: false, error: "server" });
  });
});

describe("verifyTurnstile", () => {
  const check = { token: "t", secret: "s", remoteIp: null, expectedAction: TURNSTILE_ACTION };

  it("falla cerrado si la API no responde", async () => {
    const offline = vi.fn(async () => {
      throw new Error("sin red");
    });
    expect(await verifyTurnstile(check, offline)).toBe(false);
  });

  it("no llama a la API sin token o con un token desmedido", async () => {
    const fetchFn = fakeFetch();
    expect(await verifyTurnstile({ ...check, token: "" }, fetchFn)).toBe(false);
    expect(await verifyTurnstile({ ...check, token: "x".repeat(3000) }, fetchFn)).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
