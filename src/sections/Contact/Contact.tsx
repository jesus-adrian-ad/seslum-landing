/**
 * Contacto: WhatsApp, correo y llamada como tres vías equivalentes.
 *
 * Cada tarjeta es un solo enlace estático con toda su superficie como área
 * táctil, marcado para que ClickTracker publique su evento con source "contact". Los datos salen de
 * site.json; esta sección solo aporta el nombre y la nota de cada vía. Debajo,
 * una línea con las ciudades con atención local y la cobertura nacional. El
 * formulario (bloque 10) se monta debajo de las tarjetas.
 */

import { ContactIcon } from "@/components/ContactIcon/ContactIcon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import { trackingAttributes } from "@/lib/analytics";
import { buildContactChannels } from "@/lib/contact-links";
import { officesSentence } from "@/lib/offices";
import type { ContactContent, SiteContact, SiteLocation } from "@/types/content";
import styles from "./Contact.module.css";

const EXTERNAL_LINK = { target: "_blank", rel: "noopener noreferrer" } as const;

export interface ContactProps {
  readonly content: ContactContent;
  readonly contact: SiteContact;
  readonly location: SiteLocation;
}

export function Contact({ content, contact, location }: ContactProps) {
  const titleId = `${content.id}-title`;
  const channels = buildContactChannels(content, contact);

  return (
    <section id={content.id} className={styles.contact} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <ul className={styles.channels} role="list">
          {channels.map((channel) => (
            <li key={channel.kind} data-reveal="">
              <a
                href={channel.href}
                className={`chamfer-frame ${styles.channel}`}
                {...trackingAttributes(channel.event, "contact")}
                {...(channel.external ? EXTERNAL_LINK : {})}
              >
                <ContactIcon name={channel.kind} className={styles.icon} draw />
                <span className={styles.name}>{channel.name}</span>{" "}
                <span className={styles.value}>{channel.value}</span>{" "}
                <span className={styles.note}>{channel.note}</span>
                {channel.external ? <span className="visually-hidden"> {content.newTabHint}</span> : null}
              </a>
            </li>
          ))}
        </ul>

        <p className={styles.offices} data-reveal="">
          {`${content.officesLabel} ${officesSentence(location.offices)}. ${location.serviceArea}.`}
        </p>
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
