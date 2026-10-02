/**
 * Enlaces de contacto y validación del contenido de Contacto.
 *
 * Los datos (número, correo, mensaje de WhatsApp) viven solo en site.json; la
 * sección aporta el nombre y la nota de cada vía. Así un cambio de teléfono se
 * hace en un solo lugar y llega a la sección, al botón flotante y a los datos
 * estructurados. Cada vía lleva el evento de medición que le toca.
 */

import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analytics";
import { assertIconName } from "@/lib/icon-catalog";
import {
  CONTACT_CHANNEL_KINDS,
  type ContactChannelKind,
  type ContactContent,
  type SiteContact,
} from "@/types/content";

export interface ContactChannel {
  readonly kind: ContactChannelKind;
  readonly name: string;
  readonly note: string;
  readonly value: string;
  readonly href: string;
  readonly event: AnalyticsEventName;
  readonly external: boolean;
}

export function whatsappHref(number: string, message: string): string {
  const base = `https://wa.me/${number}`;
  return message.trim() === "" ? base : `${base}?text=${encodeURIComponent(message)}`;
}

export function phoneHref(e164: string): string {
  return `tel:${e164}`;
}

export function emailHref(email: string): string {
  return `mailto:${email}`;
}

export function parseContactContent(raw: ContactContent<string>): ContactContent {
  if (raw.channels.length === 0) {
    throw new Error("Contacto necesita al menos una vía.");
  }
  const seen = new Set<string>();
  const channels = raw.channels.map((channel, index) => {
    const kind = assertIconName(CONTACT_CHANNEL_KINDS, channel.kind, `contact.channels[${index}]`);
    if (seen.has(kind)) {
      throw new Error(`La vía "${kind}" está repetida en Contacto.`);
    }
    seen.add(kind);
    return { ...channel, kind };
  });
  return { ...raw, channels };
}

export function buildContactChannels(content: ContactContent, contact: SiteContact): ContactChannel[] {
  return content.channels.map(({ kind, name, note }) => {
    switch (kind) {
      case "whatsapp":
        return {
          kind,
          name,
          note,
          value: contact.whatsapp.display,
          href: whatsappHref(contact.whatsapp.number, contact.whatsapp.message),
          event: ANALYTICS_EVENTS.whatsappClick,
          external: true,
        };
      case "email":
        return {
          kind,
          name,
          note,
          value: contact.email,
          href: emailHref(contact.email),
          event: ANALYTICS_EVENTS.emailClick,
          external: false,
        };
      case "phone":
        return {
          kind,
          name,
          note,
          value: contact.phone.display,
          href: phoneHref(contact.phone.e164),
          event: ANALYTICS_EVENTS.phoneClick,
          external: false,
        };
    }
  });
}
