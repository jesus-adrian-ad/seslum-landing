/**
 * Contratos de tipos para el contenido del cliente en src/content.
 *
 * Los JSON de contenido se validan contra estas interfaces en tiempo de
 * compilación, así un texto mal capturado rompe el build y no el sitio.
 */

export interface PhoneContact {
  readonly display: string;
  readonly e164: string;
}

export interface WhatsAppContact {
  readonly display: string;
  readonly number: string;
}

export interface BusinessHours {
  readonly label: string;
  readonly days: readonly string[];
  readonly opens: string;
  readonly closes: string;
}

export interface SiteContact {
  readonly phone: PhoneContact;
  readonly whatsapp: WhatsAppContact;
  readonly email: string;
  readonly emailResponseTime: string;
  readonly hours: BusinessHours;
}

export interface SiteLocation {
  readonly locality: string;
  readonly region: string;
  readonly regionCode: string;
  readonly country: string;
  readonly serviceArea: string;
  readonly areaServed: string;
}

export interface SiteSeo {
  readonly title: string;
  readonly description: string;
}

export interface SiteContent {
  readonly name: string;
  readonly brandName: string;
  readonly url: string;
  readonly locale: string;
  readonly description: string;
  readonly brand: { readonly themeColor: string };
  readonly seo: SiteSeo;
  readonly contact: SiteContact;
  readonly location: SiteLocation;
  readonly social: { readonly linkedin: string | null };
}
