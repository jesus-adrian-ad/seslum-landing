import { describe, expect, it } from "vitest";
import { buildConsentBootstrapScript } from "@/lib/consent-bootstrap";
import { buildGtmNoscriptHtml, buildGtmOnLoadScript } from "@/lib/gtm";
import { buildGtmManifest } from "@/lib/gtm-manifest";

describe("buildGtmManifest", () => {
  it("puts the consent default before Google's snippet", () => {
    const manifest = buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: false });
    expect(manifest.headScripts).toEqual([buildConsentBootstrapScript(), buildGtmOnLoadScript("GTM-NPV6M437")]);
    expect(manifest.bodyHtml).toBe(buildGtmNoscriptHtml("GTM-NPV6M437"));
  });

  it("installs nothing while the site is coming soon", () => {
    expect(buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: true })).toEqual({});
  });

  it.each(["", "GTM-", "not-an-id"])("installs nothing with the id %j", (gtmId) => {
    expect(buildGtmManifest({ gtmId, comingSoon: false })).toEqual({});
  });

  it("never emits a closing script tag inside the inline scripts", () => {
    const manifest = buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: false });
    for (const script of manifest.headScripts ?? []) {
      expect(script.toLowerCase()).not.toContain("</script");
    }
  });
});
