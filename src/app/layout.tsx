/**
 * Layout base del sitio: documento, fuente, metadatos, datos estructurados y
 * medición. Todas las secciones se montan dentro de este layout.
 */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { TagManager } from "@/components/TagManager";
import { site } from "@/lib/content";
import { buildEnv, isProduction } from "@/lib/env";
import { buildSiteMetadata } from "@/lib/seo";
import { buildLocalBusinessSchema } from "@/lib/structured-data";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/pages/not-found.css";

const sourceSans = localFont({
  src: "../fonts/SourceSans3-Variable-latin.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  variable: "--font-source-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = buildSiteMetadata(site, isProduction);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: site.brand.themeColor,
  colorScheme: "dark",
};

export interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es-MX" className={sourceSans.variable}>
      <body>
        <a className="skip-link" href="#main">
          Saltar al contenido
        </a>
        {children}
        <StructuredData data={buildLocalBusinessSchema(site)} />
        <TagManager gtmId={buildEnv.gtmId} />
      </body>
    </html>
  );
}
