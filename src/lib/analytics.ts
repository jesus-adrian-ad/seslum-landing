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

export const EVENT_SOURCES = ["header", "hero", "contact", "footer", "floating", "form"] as const;

export type EventSource = (typeof EVENT_SOURCES)[number];

export const TRACK_EVENT_ATTRIBUTE = "data-track-event";
export const TRACK_SOURCE_ATTRIBUTE = "data-track-source";

export interface TrackedClick {
  readonly event: AnalyticsEventName;
  readonly source: EventSource;
}

const EVENT_NAMES: readonly string[] = Object.values(ANALYTICS_EVENTS);
const SOURCE_NAMES: readonly string[] = EVENT_SOURCES;

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

/**
 * Atributos que marcan un enlace para medir su clic. Los lee ClickTracker con un
 * solo listener para toda la página, así los enlaces siguen siendo HTML estático.
 */
export function trackingAttributes(event: AnalyticsEventName, source: EventSource): Readonly<Record<string, string>> {
  return { [TRACK_EVENT_ATTRIBUTE]: event, [TRACK_SOURCE_ATTRIBUTE]: source };
}

export function parseTrackedClick(event: string | null, source: string | null): TrackedClick | null {
  if (event === null || source === null || !EVENT_NAMES.includes(event) || !SOURCE_NAMES.includes(source)) {
    return null;
  }
  return { event: event as AnalyticsEventName, source: source as EventSource };
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
