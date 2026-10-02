import { describe, expect, it } from "vitest";
import { faq, site } from "@/lib/content";
import {
  STRUCTURED_DATA_PAGE,
  buildFaqPageSchema,
  buildLocalBusinessSchema,
  buildStructuredDataManifest,
  serializeJsonLd,
} from "@/lib/structured-data";

describe("buildLocalBusinessSchema", () => {
  const schema = buildLocalBusinessSchema(site);

  it("declares a LocalBusiness with the client contact data", () => {
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.telephone).toBe(site.contact.phone.e164);
    expect(schema.email).toBe(site.contact.email);
  });

  it("points logo and image at the canonical domain", () => {
    expect(schema.logo).toBe(`${site.url}${site.brand.logo}`);
    expect(schema.image).toBe(`${site.url}${site.seo.image.src}`);
  });

  it("omits sameAs while there is no LinkedIn profile", () => {
    expect(site.social.linkedin).toBeNull();
    expect(schema).not.toHaveProperty("sameAs");
  });
});

describe("buildFaqPageSchema", () => {
  const schema = buildFaqPageSchema(faq, site);

  it("declares a FAQPage anchored to the section", () => {
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema["@id"]).toBe(`${site.url}/#${faq.id}`);
  });

  it("publishes every question with the same text shown on the page", () => {
    expect(schema.mainEntity).toEqual(
      faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    );
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the script element or inject markup", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>&" });
    expect(output).not.toMatch(/[<>&]/);
    expect(JSON.parse(output)).toEqual({ name: "</script><script>alert(1)</script>&" });
  });
});

describe("buildStructuredDataManifest", () => {
  it("publishes LocalBusiness and FAQPage, already escaped, on the home page", () => {
    const manifest = buildStructuredDataManifest(site, faq);
    expect(Object.keys(manifest)).toEqual([STRUCTURED_DATA_PAGE]);
    expect(manifest[STRUCTURED_DATA_PAGE]).toEqual([
      serializeJsonLd(buildLocalBusinessSchema(site)),
      serializeJsonLd(buildFaqPageSchema(faq, site)),
    ]);
  });
});
