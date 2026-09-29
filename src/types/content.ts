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

export interface ImageAsset {
  readonly src: string;
  readonly srcSet?: string;
  readonly sizes?: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface NavLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface CallToAction {
  readonly label: string;
  readonly shortLabel: string;
  readonly href: string;
}

export interface NavbarContent {
  readonly logo: ImageAsset;
  readonly homeHref: string;
  readonly ariaLabel: string;
  readonly links: readonly NavLink[];
  readonly cta: CallToAction;
  readonly menu: {
    readonly openLabel: string;
    readonly closeLabel: string;
    readonly title: string;
  };
}
