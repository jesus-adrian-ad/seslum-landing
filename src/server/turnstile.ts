/**
 * Verificación del token de Turnstile contra la API de Cloudflare.
 *
 * Sin esta verificación el widget es decorativo: un bot puede llamar al
 * endpoint directo. Se exige además que el token se haya emitido para la acción
 * del formulario, para que no sirva uno sacado de otro widget de la cuenta. Si
 * la API no responde, el envío se rechaza (falla cerrado).
 */

export const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const MAX_TOKEN_LENGTH = 2048;

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export interface TurnstileCheck {
  readonly token: string;
  readonly secret: string;
  readonly remoteIp: string | null;
  readonly expectedAction: string;
}

interface SiteverifyResponse {
  readonly success?: unknown;
  readonly action?: unknown;
}

export async function verifyTurnstile(check: TurnstileCheck, fetchFn: FetchLike): Promise<boolean> {
  if (!check.token || check.token.length > MAX_TOKEN_LENGTH || !check.secret) {
    return false;
  }
  const body = new FormData();
  body.append("secret", check.secret);
  body.append("response", check.token);
  if (check.remoteIp) {
    body.append("remoteip", check.remoteIp);
  }
  try {
    const response = await fetchFn(SITEVERIFY_URL, { method: "POST", body });
    if (!response.ok) {
      return false;
    }
    const result = (await response.json()) as SiteverifyResponse;
    return result.success === true && (result.action === undefined || result.action === check.expectedAction);
  } catch {
    return false;
  }
}
