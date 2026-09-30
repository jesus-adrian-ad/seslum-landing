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
  readonly image: ImageAsset;
}

export interface SiteContent {
  readonly name: string;
  readonly brandName: string;
  readonly url: string;
  readonly locale: string;
  readonly description: string;
  readonly brand: { readonly themeColor: string; readonly logo: string };
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

export interface LinkAction {
  readonly label: string;
  readonly href: string;
}

export interface HeroContent {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly primaryCta: LinkAction;
  readonly secondaryCta: LinkAction;
  readonly image: ImageAsset;
  readonly panel: {
    readonly title: string;
    readonly lines: readonly string[];
    readonly more: string;
  };
}

export const SERVICE_ICON_NAMES = [
  "cctv",
  "access-control",
  "intrusion",
  "fire-detection",
  "fire-suppression",
  "structured-cabling",
  "electrical",
  "precision-cooling",
  "engineering",
  "maintenance",
] as const;

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number];

export interface ServiceItem<Icon extends string = ServiceIconName> {
  readonly icon: Icon;
  readonly name: string;
  readonly description: string;
}

export interface ServiceGroup<Icon extends string = ServiceIconName> {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly items: readonly ServiceItem<Icon>[];
}

export interface ServicesContent<Icon extends string = ServiceIconName> {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly groups: readonly ServiceGroup<Icon>[];
  readonly transversal: {
    readonly title: string;
    readonly items: readonly ServiceItem<Icon>[];
  };
}

export const SECTOR_ICON_NAMES = [
  "industrial",
  "corporate",
  "banking",
  "hospitality",
  "health",
  "retail",
  "residential",
] as const;

export type SectorIconName = (typeof SECTOR_ICON_NAMES)[number];

export interface SectorItem<Icon extends string = SectorIconName> {
  readonly id: string;
  readonly icon: Icon;
  readonly name: string;
  readonly summary: string;
  readonly description: string;
}

export interface SectorsContent<Icon extends string = SectorIconName> {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly tabsLabel: string;
  readonly sectors: readonly SectorItem<Icon>[];
}

export interface ComparisonRow {
  readonly criterion: string;
  readonly integrator: string;
  readonly separate: string;
}

export interface WhySeslumContent {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly table: {
    readonly caption: string;
    readonly criterionLabel: string;
    readonly integratorLabel: string;
    readonly separateLabel: string;
    readonly rows: readonly ComparisonRow[];
  };
}
