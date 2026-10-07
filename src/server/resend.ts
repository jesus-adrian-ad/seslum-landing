/**
 * Envío de correo por la API HTTP de Resend, sin SDK: una sola llamada no
 * justifica una dependencia más en el bundle de la Function.
 */

import type { OutgoingEmail } from "./contact-email";
import type { FetchLike } from "./turnstile";

export const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export async function sendEmail(email: OutgoingEmail, apiKey: string, fetchFn: FetchLike): Promise<boolean> {
  if (!apiKey) {
    return false;
  }
  try {
    const response = await fetchFn(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });
    return response.ok;
  } catch {
    return false;
  }
}
