import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { contact, site } from "@/lib/content";
import { WhatsAppFloat } from "./WhatsAppFloat";

const markup = renderToStaticMarkup(
  <WhatsAppFloat
    whatsapp={site.contact.whatsapp}
    label={contact.floatingLabel}
    channelHint={contact.floatingChannelHint}
    newTabHint={contact.newTabHint}
  />,
);

describe("WhatsAppFloat", () => {
  it("muestra la invitación desde el HTML estático, extendido", () => {
    expect(markup).toContain(`>${contact.floatingLabel}</span>`);
    expect(markup).not.toContain("data-collapsed");
  });

  it("dice a los lectores de pantalla que es WhatsApp y que abre otra pestaña", () => {
    expect(markup).toContain(contact.floatingChannelHint);
    expect(markup).toContain(contact.newTabHint);
  });

  it("abre WhatsApp en otra pestaña y se mide como clic flotante", () => {
    expect(markup).toContain('href="https://wa.me/');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain('data-track-source="floating"');
  });
});
