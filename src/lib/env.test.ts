import { describe, expect, it } from "vitest";
import { parseDeployUrl, resolveBuildEnv, resolvePublicUrl, resolveTurnstileSiteKey, TURNSTILE_TEST_SITE_KEY } from "./env";

const CANONICAL = "https://seslum.com.mx";

describe("parseDeployUrl", () => {
  it("acepta el origen https del alias de la rama", () => {
    expect(parseDeployUrl("https://develop.seslum-landing.pages.dev/")).toBe("https://develop.seslum-landing.pages.dev");
  });

  it("descarta valores vacíos, sin https o con ruta", () => {
    expect(parseDeployUrl(undefined)).toBeNull();
    expect(parseDeployUrl("  ")).toBeNull();
    expect(parseDeployUrl("http://develop.seslum-landing.pages.dev")).toBeNull();
    expect(parseDeployUrl("https://develop.seslum-landing.pages.dev/otra")).toBeNull();
    expect(parseDeployUrl("no es una url")).toBeNull();
  });
});

describe("resolvePublicUrl", () => {
  it("usa el alias de la rama en staging", () => {
    const env = resolveBuildEnv({ NEXT_PUBLIC_SITE_URL: "https://feat-x.seslum-landing.pages.dev" });
    expect(resolvePublicUrl(CANONICAL, env)).toBe("https://feat-x.seslum-landing.pages.dev");
  });

  it("usa siempre el dominio canónico en producción", () => {
    const env = resolveBuildEnv({
      NEXT_PUBLIC_SITE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://otro.pages.dev",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AAAAAAA",
    });
    expect(resolvePublicUrl(CANONICAL, env)).toBe(CANONICAL);
  });

  it("cae al dominio canónico si staging no trae alias", () => {
    expect(resolvePublicUrl(CANONICAL, resolveBuildEnv({}))).toBe(CANONICAL);
  });
});

describe("resolveTurnstileSiteKey", () => {
  it("usa la clave configurada, sin espacios", () => {
    expect(resolveTurnstileSiteKey(" 0x4AAAAAAA ", "production")).toBe("0x4AAAAAAA");
  });

  it("en staging cae a la clave de prueba de Cloudflare", () => {
    expect(resolveTurnstileSiteKey(undefined, "staging")).toBe(TURNSTILE_TEST_SITE_KEY);
  });

  it("en producción falla el build si no hay clave", () => {
    expect(() => resolveTurnstileSiteKey("", "production")).toThrow(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  });
});
