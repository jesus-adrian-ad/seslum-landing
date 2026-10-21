/**
 * Fragmento de Google Ads para medir las llamadas al teléfono del sitio
 * ("Llamadas desde su sitio web"), tal como lo entrega marketing.
 *
 * La etiqueta de Google (`AW-…`) ya la carga el contenedor de GTM, así que aquí
 * solo va lo que Google pide colocar después de ella: la función `gtag` estándar
 * y el `config` con la conversión y el número que se reemplaza por uno de
 * desvío. Los comandos quedan en el `dataLayer` y la etiqueta de Google los
 * procesa al cargar; el consentimiento por defecto se declara antes.
 *
 * El número debe ser idéntico al texto visible (Google lo busca tal cual en la
 * página), por eso sale de site.json. La conversión y el número se validan antes
 * de insertarlos: un valor mal formado no puede inyectar código. Sin conversión
 * en site.json (null) no se instala nada.
 */

import type { SiteContent } from "@/types/content";

const PHONE_CONVERSION_PATTERN = /^AW-\d{6,15}\/[A-Za-z0-9_-]{6,64}$/;
const PHONE_DISPLAY_PATTERN = /^\d[\d ]{5,18}\d$/;

export interface PhoneConversion {
  readonly conversion: string;
  readonly phone: string;
}

export function isValidPhoneConversion(conversion: string): boolean {
  return PHONE_CONVERSION_PATTERN.test(conversion);
}

export function buildPhoneConversionScript({ conversion, phone }: PhoneConversion): string {
  if (!isValidPhoneConversion(conversion)) {
    throw new Error(`Conversión de llamadas de Google Ads inválida: ${JSON.stringify(conversion)}`);
  }
  if (!PHONE_DISPLAY_PATTERN.test(phone)) {
    throw new Error(`Número para la conversión de llamadas inválido: ${JSON.stringify(phone)}`);
  }
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${conversion}',{'phone_conversion_number':'${phone}'});`;
}

export function sitePhoneConversion(site: SiteContent): PhoneConversion | null {
  const { phoneConversion } = site.googleAds;
  return phoneConversion === null ? null : { conversion: phoneConversion, phone: site.contact.phone.display };
}
