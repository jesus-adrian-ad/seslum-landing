/**
 * Layout base del sitio: documento, fuente, metadatos y medición. Todas las
 * secciones se montan dentro de este layout. Los datos estructurados se
 * insertan después del build (ver structured-data.json/route.ts).
 */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { ClickTracker } from "@/components/ClickTracker/ClickTracker";
import { CookieConsent } from "@/components/CookieConsent/CookieConsent";
import { TagManager } from "@/components/TagManager";
import { consent, site } from "@/lib/content";
import { buildEnv, isProduction, resolvePublicUrl } from "@/lib/env";
import { buildSiteMetadata } from "@/lib/seo";
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

export const metadata: Metadata = buildSiteMetadata(site, {
  indexable: isProduction,
  publicUrl: resolvePublicUrl(site.url, buildEnv),
});

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
        <TagManager gtmId={buildEnv.gtmId} />
        <ClickTracker />
        <CookieConsent content={consent} />
      </body>
    </html>
  );
}
