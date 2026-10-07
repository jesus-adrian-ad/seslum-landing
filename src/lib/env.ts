/**
 * Configuración de entorno resuelta en tiempo de build.
 *
 * El sitio es estático: estos valores quedan fijos en el HTML generado. Solo se
 * leen variables públicas; los secretos viven en Cloudflare y nunca pasan por aquí.
 *
 * NEXT_PUBLIC_SITE_URL es la dirección pública del despliegue de staging (el
 * alias de la rama en Cloudflare Pages). Solo se acepta con https y sin ruta;
 * cualquier otro valor se descarta y el sitio usa su dominio canónico.
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY es la clave pública del widget de Turnstile. Es
 * obligatoria en producción; en staging y en local, si falta, se usa la clave de
 * prueba de Cloudflare (siempre pasa), así el build no depende de la cuenta.
 */

export type SiteEnvironment = "production" | "staging";

export interface BuildEnv {
  readonly siteEnv: SiteEnvironment;
  readonly gtmId: string;
  readonly deployUrl: string | null;
  readonly turnstileSiteKey: string;
}

export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

export function resolveTurnstileSiteKey(value: string | undefined, siteEnv: SiteEnvironment): string {
  const key = (value ?? "").trim();
  if (key) {
    return key;
  }
  if (siteEnv === "production") {
    throw new Error("Falta NEXT_PUBLIC_TURNSTILE_SITE_KEY: el formulario no puede publicarse sin Turnstile.");
  }
  return TURNSTILE_TEST_SITE_KEY;
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
  const siteEnv: SiteEnvironment = source.NEXT_PUBLIC_SITE_ENV === "production" ? "production" : "staging";
  return {
    siteEnv,
    gtmId: (source.NEXT_PUBLIC_GTM_ID ?? "").trim(),
    deployUrl: parseDeployUrl(source.NEXT_PUBLIC_SITE_URL),
    turnstileSiteKey: resolveTurnstileSiteKey(source.NEXT_PUBLIC_TURNSTILE_SITE_KEY, siteEnv),
  };
}

export function resolvePublicUrl(canonicalUrl: string, env: BuildEnv): string {
  return env.siteEnv === "production" || !env.deployUrl ? canonicalUrl : env.deployUrl;
}

export const buildEnv: BuildEnv = resolveBuildEnv({
  NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

export const isProduction: boolean = buildEnv.siteEnv === "production";
