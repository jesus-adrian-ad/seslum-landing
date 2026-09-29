/**
 * Configuración de entorno resuelta en tiempo de build.
 *
 * El sitio es estático: estos valores quedan fijos en el HTML generado. Solo se
 * leen variables públicas; los secretos viven en Cloudflare y nunca pasan por aquí.
 */

export type SiteEnvironment = "production" | "staging";

export interface BuildEnv {
  readonly siteEnv: SiteEnvironment;
  readonly gtmId: string;
}

export function resolveBuildEnv(source: Readonly<Record<string, string | undefined>>): BuildEnv {
  return {
    siteEnv: source.NEXT_PUBLIC_SITE_ENV === "production" ? "production" : "staging",
    gtmId: (source.NEXT_PUBLIC_GTM_ID ?? "").trim(),
  };
}

export const buildEnv: BuildEnv = resolveBuildEnv({
  NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
});

export const isProduction: boolean = buildEnv.siteEnv === "production";
