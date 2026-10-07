/**
 * Carga del widget de Turnstile en el navegador.
 *
 * El script de Cloudflare se inserta una sola vez y solo cuando el formulario
 * se acerca a la vista: así no compite con la carga inicial ni con el LCP. Se
 * usa el modo de render explícito para montar el widget en el contenedor del
 * formulario y leer el token por callback. La CSP permite
 * challenges.cloudflare.com en script-src y frame-src.
 */

export const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface TurnstileRenderOptions {
  readonly sitekey: string;
  readonly action: string;
  readonly theme: "dark" | "light" | "auto";
  readonly size: "normal" | "flexible" | "compact";
  readonly appearance: "always" | "execute" | "interaction-only";
  readonly language: string;
  readonly callback: (token: string) => void;
  readonly "expired-callback": () => void;
  readonly "error-callback": () => void;
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let pending: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  pending ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        pending = null;
        reject(new Error("Turnstile cargó sin exponer su API."));
      }
    });
    script.addEventListener("error", () => {
      pending = null;
      script.remove();
      reject(new Error("No se pudo cargar Turnstile."));
    });
    document.head.append(script);
  });
  return pending;
}
