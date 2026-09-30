import { describe, expect, it } from "vitest";
import { parseDeployUrl, resolveBuildEnv, resolvePublicUrl } from "./env";

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
    const env = resolveBuildEnv({ NEXT_PUBLIC_SITE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://otro.pages.dev" });
    expect(resolvePublicUrl(CANONICAL, env)).toBe(CANONICAL);
  });

  it("cae al dominio canónico si staging no trae alias", () => {
    expect(resolvePublicUrl(CANONICAL, resolveBuildEnv({}))).toBe(CANONICAL);
  });
});
