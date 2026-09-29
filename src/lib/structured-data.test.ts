import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { buildLocalBusinessSchema, serializeJsonLd } from "@/lib/structured-data";

describe("buildLocalBusinessSchema", () => {
  const schema = buildLocalBusinessSchema(site);

  it("declares a LocalBusiness with the client contact data", () => {
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.telephone).toBe(site.contact.phone.e164);
    expect(schema.email).toBe(site.contact.email);
  });

  it("omits sameAs while there is no LinkedIn profile", () => {
    expect(site.social.linkedin).toBeNull();
    expect(schema).not.toHaveProperty("sameAs");
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the script element or inject markup", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>&" });
    expect(output).not.toMatch(/[<>&]/);
    expect(JSON.parse(output)).toEqual({ name: "</script><script>alert(1)</script>&" });
  });
});
