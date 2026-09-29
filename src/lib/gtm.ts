/**
 * Reglas puras para arrancar Google Tag Manager.
 *
 * Aquí solo vive lo que se puede probar sin navegador: validar el ID del
 * contenedor, armar la URL del script y el evento de arranque. Los efectos sobre
 * el DOM viven en el componente TagManager.
 */

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
const GTM_SCRIPT_ORIGIN = "https://www.googletagmanager.com";

export interface GtmStartEvent {
  readonly "gtm.start": number;
  readonly event: "gtm.js";
}

export function isValidGtmId(id: string): boolean {
  return GTM_ID_PATTERN.test(id);
}

export function buildGtmScriptUrl(id: string): string {
  const url = new URL("/gtm.js", GTM_SCRIPT_ORIGIN);
  url.searchParams.set("id", id);
  return url.toString();
}

export function buildGtmStartEvent(timestamp: number): GtmStartEvent {
  return { "gtm.start": timestamp, event: "gtm.js" };
}
