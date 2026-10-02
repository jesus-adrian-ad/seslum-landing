/**
 * Contacto: WhatsApp, correo y llamada como tres vías equivalentes.
 *
 * Cada tarjeta es un solo enlace con toda su superficie como área táctil, y
 * publica su evento de medición con source "contact". Los datos salen de
 * site.json; esta sección solo aporta el nombre y la nota de cada vía. El
 * formulario (bloque 10) se monta debajo de las tarjetas.
 */

import { ContactIcon } from "@/components/ContactIcon/ContactIcon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import { TrackedLink } from "@/components/TrackedLink/TrackedLink";
import { buildContactChannels } from "@/lib/contact-links";
import type { ContactContent, SiteContact } from "@/types/content";
import styles from "./Contact.module.css";

export interface ContactProps {
  readonly content: ContactContent;
  readonly contact: SiteContact;
}

export function Contact({ content, contact }: ContactProps) {
  const titleId = `${content.id}-title`;
  const channels = buildContactChannels(content, contact);

  return (
    <section id={content.id} className={styles.contact} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <ul className={styles.channels} role="list">
          {channels.map((channel) => (
            <li key={channel.kind} data-reveal="">
              <TrackedLink
                href={channel.href}
                event={channel.event}
                source="contact"
                external={channel.external}
                className={`chamfer-frame ${styles.channel}`}
              >
                <ContactIcon name={channel.kind} className={styles.icon} draw />
                <span className={styles.name}>{channel.name}</span>{" "}
                <span className={styles.value}>{channel.value}</span>{" "}
                <span className={styles.note}>{channel.note}</span>
                {channel.external ? <span className="visually-hidden"> {content.newTabHint}</span> : null}
              </TrackedLink>
            </li>
          ))}
        </ul>
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
