import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { buildSiteMetadata } from "./seo";

describe("buildSiteMetadata", () => {
  const staging = buildSiteMetadata(site, { indexable: false, publicUrl: "https://develop.seslum-landing.pages.dev" });

  it("resuelve las direcciones contra la URL pública del despliegue", () => {
    expect(staging.metadataBase?.toString()).toBe("https://develop.seslum-landing.pages.dev/");
  });

  it("publica la imagen de vista previa con sus dimensiones", () => {
    expect(staging.openGraph?.images).toEqual([
      expect.objectContaining({ url: site.seo.image.src, width: 1200, height: 630, alt: site.seo.image.alt }),
    ]);
    expect(staging.twitter).toEqual(expect.objectContaining({ card: "summary_large_image" }));
  });

  it("solo es indexable cuando se pide", () => {
    expect(staging.robots).toEqual({ index: false, follow: false });
    expect(buildSiteMetadata(site, { indexable: true, publicUrl: site.url }).robots).toEqual({ index: true, follow: true });
  });
});
