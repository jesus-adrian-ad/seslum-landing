/**
 * Metadatos de la página (title, description, canonical, Open Graph, robots).
 *
 * En staging el sitio se marca como no indexable para que los previews de
 * Cloudflare Pages nunca compitan en Google con el dominio productivo. Las
 * direcciones absolutas (canonical, og:url, og:image) salen de publicUrl: en
 * staging es el alias de la rama, así la vista previa al compartir un link de
 * prueba carga su propia imagen y no la del dominio, que aún no sirve este sitio.
 */

import type { Metadata } from "next";
import type { SiteContent } from "@/types/content";

export interface SiteMetadataOptions {
  readonly indexable: boolean;
  readonly publicUrl: string;
}

export function buildSiteMetadata(site: SiteContent, { indexable, publicUrl }: SiteMetadataOptions): Metadata {
  const { image } = site.seo;
  const ogImage = { url: image.src, width: image.width, height: image.height, alt: image.alt, type: "image/jpeg" };
  return {
    metadataBase: new URL(publicUrl),
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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.title,
      description: site.seo.description,
      images: [{ url: image.src, alt: image.alt }],
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}
