/**
 * Configuración de entorno resuelta en tiempo de build.
 *
 * El sitio es estático: estos valores quedan fijos en el HTML generado. Solo se
 * leen variables públicas; los secretos viven en Cloudflare y nunca pasan por aquí.
 *
 * NEXT_PUBLIC_SITE_URL es la dirección pública del despliegue de staging (el
 * alias de la rama en Cloudflare Pages). Solo se acepta con https y sin ruta;
 * cualquier otro valor se descarta y el sitio usa su dominio canónico.
 */

export type SiteEnvironment = "production" | "staging";

export interface BuildEnv {
  readonly siteEnv: SiteEnvironment;
  readonly gtmId: string;
  readonly deployUrl: string | null;
}

export function parseDeployUrl(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" && url.pathname === "/" && !url.search && !url.hash ? url.origin : null;
  } catch {
    return null;
  }
}

export function resolveBuildEnv(source: Readonly<Record<string, string | undefined>>): BuildEnv {
  return {
    siteEnv: source.NEXT_PUBLIC_SITE_ENV === "production" ? "production" : "staging",
    gtmId: (source.NEXT_PUBLIC_GTM_ID ?? "").trim(),
    deployUrl: parseDeployUrl(source.NEXT_PUBLIC_SITE_URL),
  };
}

export function resolvePublicUrl(canonicalUrl: string, env: BuildEnv): string {
  return env.siteEnv === "production" || !env.deployUrl ? canonicalUrl : env.deployUrl;
}

export const buildEnv: BuildEnv = resolveBuildEnv({
  NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const isProduction: boolean = buildEnv.siteEnv === "production";
