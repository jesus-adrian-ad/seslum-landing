/**
 * Datos estructurados (JSON-LD) de schema.org a partir del contenido del sitio.
 *
 * Solo se publican datos que el cliente entregó. Sin dirección exacta, la
 * ubicación se declara a nivel ciudad, y el área de servicio como texto. Las
 * preguntas frecuentes se publican como FAQPage con el mismo texto visible en la
 * sección, como pide Google.
 */

import type { FaqContent, SiteContent } from "@/types/content";

export type JsonLdValue = string | number | boolean | null | readonly JsonLdValue[] | { readonly [key: string]: JsonLdValue };

export type JsonLdObject = { readonly [key: string]: JsonLdValue };

const UNSAFE_JSON_CHARACTERS = /[<>&\u2028\u2029]/g;

const JSON_ESCAPES: Readonly<Record<string, string>> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function buildLocalBusinessSchema(site: SiteContent): JsonLdObject {
  const { contact, location } = site;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#organization`,
    name: site.name,
    description: site.description,
    url: site.url,
    logo: `${site.url}${site.brand.logo}`,
    image: `${site.url}${site.seo.image.src}`,
    telephone: contact.phone.e164,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.locality,
      addressRegion: location.regionCode,
      addressCountry: location.country,
    },
    areaServed: location.areaServed,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: contact.hours.days.map((day) => `https://schema.org/${day}`),
        opens: contact.hours.opens,
        closes: contact.hours.closes,
      },
    ],
    ...(site.social.linkedin ? { sameAs: [site.social.linkedin] } : {}),
  };
}

export function buildFaqPageSchema(faq: FaqContent, site: SiteContent): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}/#${faq.id}`,
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(UNSAFE_JSON_CHARACTERS, (character) => JSON_ESCAPES[character] ?? character);
}
