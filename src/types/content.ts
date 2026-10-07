/**
 * Contratos de tipos para el contenido del cliente en src/content.
 *
 * Los JSON de contenido se validan contra estas interfaces en tiempo de
 * compilación, así un texto mal capturado rompe el build y no el sitio.
 */

import type { ContactField, FieldErrorCode } from "@/lib/contact-form";

export interface PhoneContact {
  readonly display: string;
  readonly e164: string;
}

export interface WhatsAppContact {
  readonly display: string;
  readonly number: string;
  readonly message: string;
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
  readonly offices: readonly string[];
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

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface FaqContent {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly items: readonly FaqItem[];
}

export const CONTACT_CHANNEL_KINDS = ["whatsapp", "email", "phone"] as const;

export type ContactChannelKind = (typeof CONTACT_CHANNEL_KINDS)[number];

export interface ContactChannelContent<Kind extends string = ContactChannelKind> {
  readonly kind: Kind;
  readonly name: string;
  readonly note: string;
}

export interface ContactContent<Kind extends string = ContactChannelKind> {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly channels: readonly ContactChannelContent<Kind>[];
  readonly officesLabel: string;
  readonly floatingLabel: string;
  readonly newTabHint: string;
}

export interface FooterContent {
  readonly id: string;
  readonly logoAlt: string;
  readonly headings: {
    readonly navigation: string;
    readonly services: string;
    readonly contact: string;
  };
  readonly navigationLabel: string;
  readonly social: {
    readonly label: string;
    readonly linkedin: string;
    readonly whatsapp: string;
  };
  readonly contactLabels: {
    readonly phoneNote: string;
  };
  readonly rights: string;
  readonly privacyLink: string;
  readonly consentLink: string;
  readonly newTabHint: string;
  readonly credit: {
    readonly prefix: string;
    readonly label: string;
    readonly href: string;
  };
}

export interface ConsentCategoryContent {
  readonly name: string;
  readonly description: string;
}

export interface ConsentContent {
  readonly title: string;
  readonly body: string;
  readonly privacyLink: string;
  readonly actions: {
    readonly acceptAll: string;
    readonly reject: string;
    readonly settings: string;
    readonly save: string;
  };
  readonly settingsTitle: string;
  readonly alwaysOn: string;
  readonly categories: {
    readonly necessary: ConsentCategoryContent;
    readonly analytics: ConsentCategoryContent;
    readonly advertising: ConsentCategoryContent;
  };
}

export interface BrandBacking {
  readonly value: string;
  readonly label: string;
}

export interface BrandPartner {
  readonly id: string;
  readonly logo: ImageAsset;
}

export interface BrandGroup {
  readonly id: string;
  readonly name: string;
  readonly brands: readonly string[];
}

export interface BrandsContent {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly backing: readonly BrandBacking[];
  readonly partnersLabel: string;
  readonly partners: readonly BrandPartner[];
  readonly alsoTitle: string;
  readonly alsoGroups: readonly BrandGroup[];
}

export interface ContactFormContent {
  readonly id: string;
  readonly title: string;
  readonly labels: Readonly<Record<ContactField, string>>;
  readonly optional: string;
  readonly placeholders: {
    readonly service: string;
    readonly message: string;
  };
  readonly errors: Readonly<Record<FieldErrorCode, string>>;
  readonly fieldErrors: Readonly<Partial<Record<ContactField, Readonly<Partial<Record<FieldErrorCode, string>>>>>>;
  readonly status: {
    readonly invalid: string;
    readonly verifying: string;
    readonly captcha: string;
    readonly server: string;
  };
  readonly submit: string;
  readonly sending: string;
  readonly success: {
    readonly title: string;
    readonly body: string;
    readonly again: string;
  };
  readonly privacy: {
    readonly before: string;
    readonly link: string;
    readonly after: string;
  };
  readonly honeypotLabel: string;
  readonly noscript: string;
}

export interface PrivacySection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly list?: readonly string[];
  readonly closing?: readonly string[];
}

export interface PrivacyContent {
  readonly title: string;
  readonly description: string;
  readonly updatedLabel: string;
  readonly updated: string;
  readonly backLabel: string;
  readonly sections: readonly PrivacySection[];
}
