/**
 * Eventos de medición del sitio, publicados en el dataLayer de Google Tag Manager.
 *
 * El código no sabe qué herramienta escucha: solo publica eventos con nombre y
 * parámetros. GA4, Google Ads o cualquier otra etiqueta se conectan desde GTM.
 */

export const ANALYTICS_EVENTS = {
  lead: "generate_lead",
  whatsappClick: "click_whatsapp",
  phoneClick: "click_phone",
  emailClick: "click_email",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type EventSource = "header" | "hero" | "contact" | "footer" | "floating" | "form";

export type EventParams = Readonly<Record<string, string | number | boolean>>;

export interface DataLayerEvent {
  readonly event: AnalyticsEventName;
  readonly [param: string]: string | number | boolean;
}

export type DataLayer = unknown[];

declare global {
  interface Window {
    dataLayer?: DataLayer;
  }
}

export function buildEvent(name: AnalyticsEventName, params: EventParams = {}): DataLayerEvent {
  return { ...params, event: name };
}

export function ensureDataLayer(target: Window): DataLayer {
  target.dataLayer ??= [];
  return target.dataLayer;
}

export function trackEvent(name: AnalyticsEventName, params: EventParams = {}): void {
  if (typeof window === "undefined") {
    return;
  }
  ensureDataLayer(window).push(buildEvent(name, params));
}
