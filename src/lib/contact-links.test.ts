import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { site } from "@/lib/content";
import type { ContactChannelContent, ContactContent } from "@/types/content";
import { buildContactChannels, emailHref, parseContactContent, phoneHref, whatsappHref } from "./contact-links";

const channel = (kind: string): ContactChannelContent<string> => ({ kind, name: "Nombre", note: "Nota" });

const base: ContactContent<string> = {
  id: "contacto",
  eyebrow: "Contacto",
  title: "Título",
  lead: "Entrada",
  channels: [channel("whatsapp"), channel("email"), channel("phone")],
  officesLabel: "Atención local en",
  floatingLabel: "Escríbanos por WhatsApp",
  newTabHint: "(se abre en otra pestaña)",
};

describe("whatsappHref", () => {
  it("codifica el mensaje precargado", () => {
    expect(whatsappHref("528117647400", "Hola, ¿cotizan?")).toBe(
      "https://wa.me/528117647400?text=Hola%2C%20%C2%BFcotizan%3F",
    );
  });

  it("omite el parámetro sin mensaje", () => {
    expect(whatsappHref("528117647400", " ")).toBe("https://wa.me/528117647400");
  });
});

describe("phoneHref y emailHref", () => {
  it("arman los esquemas tel y mailto", () => {
    expect(phoneHref("+528117647400")).toBe("tel:+528117647400");
    expect(emailHref("ventas@seslum.com.mx")).toBe("mailto:ventas@seslum.com.mx");
  });
});

describe("parseContactContent", () => {
  it("conserva el contenido válido", () => {
    expect(parseContactContent(base)).toEqual(base);
  });

  it("señala la vía desconocida con su posición", () => {
    expect(() => parseContactContent({ ...base, channels: [channel("fax")] })).toThrow(/"fax" en contact.channels\[0\]/);
  });

  it("rechaza vías repetidas", () => {
    expect(() => parseContactContent({ ...base, channels: [channel("email"), channel("email")] })).toThrow(
      /"email" está repetida/,
    );
  });

  it("rechaza una lista vacía", () => {
    expect(() => parseContactContent({ ...base, channels: [] })).toThrow(/al menos una vía/);
  });
});

describe("buildContactChannels", () => {
  const channels = buildContactChannels(parseContactContent(base), site.contact);

  it("toma los datos de site.json y respeta el orden de la sección", () => {
    expect(channels.map((c) => [c.kind, c.value])).toEqual([
      ["whatsapp", site.contact.whatsapp.display],
      ["email", site.contact.email],
      ["phone", site.contact.phone.display],
    ]);
  });

  it("asigna a cada vía su evento de medición", () => {
    expect(channels.map((c) => c.event)).toEqual([
      ANALYTICS_EVENTS.whatsappClick,
      ANALYTICS_EVENTS.emailClick,
      ANALYTICS_EVENTS.phoneClick,
    ]);
  });

  it("solo WhatsApp sale del sitio", () => {
    expect(channels.filter((c) => c.external).map((c) => c.kind)).toEqual(["whatsapp"]);
  });
});
