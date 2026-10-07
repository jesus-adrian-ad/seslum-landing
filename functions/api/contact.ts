/**
 * Pages Function del formulario de cotización (POST /api/contact).
 *
 * Solo enlaza la petición con src/server/contact-handler.ts, que tiene toda la
 * lógica. Los secretos (RESEND_API_KEY, TURNSTILE_SECRET_KEY) viven en el
 * proyecto de Pages, en Producción y Vista previa; en local, en .dev.vars.
 */

import { type ContactEnv, handleContactRequest } from "../../src/server/contact-handler";

interface PagesContext {
  readonly request: Request;
  readonly env: ContactEnv;
}

export const onRequestPost = ({ request, env }: PagesContext): Promise<Response> =>
  handleContactRequest(request, env, (input, init) => fetch(input, init));
