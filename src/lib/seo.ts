/**
 * Metadatos de la página (title, description, canonical, Open Graph, robots).
 *
 * En staging el sitio se marca como no indexable para que los previews de
 * Cloudflare Pages nunca compitan en Google con el dominio productivo.
 */

import type { Metadata } from "next";
import type { SiteContent } from "@/types/content";

export function buildSiteMetadata(site: SiteContent, indexable: boolean): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: site.seo.title,
    description: site.seo.description,
    applicationName: site.name,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: site.locale,
      url: "/",
      siteName: site.name,
      title: site.seo.title,
      description: site.seo.description,
    },
    twitter: {
      card: "summary",
      title: site.seo.title,
      description: site.seo.description,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}
