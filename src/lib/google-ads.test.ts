import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { buildPhoneConversionScript, isValidPhoneConversion, sitePhoneConversion } from "@/lib/google-ads";
import { site } from "@/lib/content";

const CONVERSION = "AW-18509852761/JD4QCOP-gqQdENngl_pE";

function run(script: string): unknown[][] {
  const context: { window?: unknown; dataLayer?: ArrayLike<unknown>[] } = {};
  context.window = context;
  runInNewContext(script, context);
  return (context.dataLayer ?? []).map((entry) => Array.from(entry));
}

describe("isValidPhoneConversion", () => {
  it("accepts the conversion marketing sent", () => {
    expect(isValidPhoneConversion(CONVERSION)).toBe(true);
  });

  it.each(["", "AW-18509852761", "G-ABC123/label12", "AW-123/abc');alert(1)//", " AW-18509852761/JD4QCOP-gqQdENngl_pE"])(
    "rejects %j",
    (conversion) => {
      expect(isValidPhoneConversion(conversion)).toBe(false);
    },
  );
});

describe("buildPhoneConversionScript", () => {
  it("pushes the config command marketing sent to the dataLayer", () => {
    const entries = run(buildPhoneConversionScript({ conversion: CONVERSION, phone: "811 764 7400" }));
    expect(entries).toEqual([["config", CONVERSION, { phone_conversion_number: "811 764 7400" }]]);
  });

  it("keeps the commands already in the dataLayer", () => {
    const script = `window.dataLayer=[["consent","default",{}]];${buildPhoneConversionScript({ conversion: CONVERSION, phone: "811 764 7400" })}`;
    expect(run(script)).toHaveLength(2);
  });

  it("refuses values that could break out of the script", () => {
    expect(() => buildPhoneConversionScript({ conversion: "AW-123/x');alert(1)//", phone: "811 764 7400" })).toThrow();
    expect(() => buildPhoneConversionScript({ conversion: CONVERSION, phone: "811');alert(1)//" })).toThrow();
  });
});

describe("sitePhoneConversion", () => {
  it("uses the phone number exactly as the site shows it", () => {
    expect(sitePhoneConversion(site)).toEqual({ conversion: CONVERSION, phone: site.contact.phone.display });
  });

  it("installs nothing without a conversion", () => {
    expect(sitePhoneConversion({ ...site, googleAds: { phoneConversion: null } })).toBeNull();
  });
});
