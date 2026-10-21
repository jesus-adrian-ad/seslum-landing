import { describe, expect, it } from "vitest";
import { buildConsentBootstrapScript } from "@/lib/consent-bootstrap";
import { buildPhoneConversionScript } from "@/lib/google-ads";
import { buildGtmNoscriptHtml, buildGtmDeferredScript } from "@/lib/gtm";
import { buildGtmManifest } from "@/lib/gtm-manifest";

describe("buildGtmManifest", () => {
  it("puts the consent default before Google's snippet", () => {
    const manifest = buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: false });
    expect(manifest.headScripts).toEqual([buildConsentBootstrapScript(), buildGtmDeferredScript("GTM-NPV6M437")]);
    expect(manifest.bodyHtml).toBe(buildGtmNoscriptHtml("GTM-NPV6M437"));
  });

  it("adds the Google Ads call snippet after the Google tag", () => {
    const phoneConversion = { conversion: "AW-18509852761/JD4QCOP-gqQdENngl_pE", phone: "811 764 7400" };
    const manifest = buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: false, phoneConversion });
    expect(manifest.headScripts).toEqual([
      buildConsentBootstrapScript(),
      buildGtmDeferredScript("GTM-NPV6M437"),
      buildPhoneConversionScript(phoneConversion),
    ]);
  });

  it("leaves out the call snippet without GTM", () => {
    const phoneConversion = { conversion: "AW-18509852761/JD4QCOP-gqQdENngl_pE", phone: "811 764 7400" };
    expect(buildGtmManifest({ gtmId: "", comingSoon: false, phoneConversion })).toEqual({});
  });

  it("installs nothing while the site is coming soon", () => {
    expect(buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: true })).toEqual({});
  });

  it.each(["", "GTM-", "not-an-id"])("installs nothing with the id %j", (gtmId) => {
    expect(buildGtmManifest({ gtmId, comingSoon: false })).toEqual({});
  });

  it("never emits a closing script tag inside the inline scripts", () => {
    const phoneConversion = { conversion: "AW-18509852761/JD4QCOP-gqQdENngl_pE", phone: "811 764 7400" };
    const manifest = buildGtmManifest({ gtmId: "GTM-NPV6M437", comingSoon: false, phoneConversion });
    for (const script of manifest.headScripts ?? []) {
      expect(script.toLowerCase()).not.toContain("</script");
    }
  });
});
