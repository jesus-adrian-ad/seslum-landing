/**
 * Pie de página: marca, navegación, servicios y contacto, con la barra de
 * derechos y el crédito de YiSoft.
 *
 * No repite contenido: los enlaces salen del navbar, las líneas de servicio de
 * services.json y los datos de contacto de site.json. Correo, teléfono y
 * WhatsApp se miden con source "footer"; las ciudades con atención local salen
 * de site.json. LinkedIn aparece solo cuando
 * site.json tenga el perfil. "Preferencias de cookies" vuelve a abrir el banner
 * de consentimiento; junto a él, el enlace al aviso de privacidad.
 */

import { ContactIcon } from "@/components/ContactIcon/ContactIcon";
import { LineIcon, type LineShape } from "@/components/LineIcon/LineIcon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { ANALYTICS_EVENTS, trackingAttributes } from "@/lib/analytics";
import { CONSENT_OPEN_ATTRIBUTE } from "@/lib/consent-runtime";
import { emailHref, phoneHref, whatsappHref } from "@/lib/contact-links";
import { copyrightLine, footerServiceLinks } from "@/lib/footer-content";
import { officesInline } from "@/lib/offices";
import { PRIVACY_PATH } from "@/lib/privacy";
import type { FooterContent, ImageAsset, NavLink, ServicesContent, SiteContent } from "@/types/content";
import styles from "./Footer.module.css";

const LINKEDIN: readonly LineShape[] = [
  { kind: "path", d: "M8 13v13" },
  { kind: "circle", cx: 8, cy: 7.5, r: 1.6, dot: true },
  { kind: "path", d: "M14.5 26v-8a4.5 4.5 0 019 0v8" },
  { kind: "path", d: "M14.5 13v13" },
];

const EXTERNAL_LINK = { target: "_blank", rel: "noopener noreferrer" } as const;

export interface FooterProps {
  readonly content: FooterContent;
  readonly site: SiteContent;
  readonly navigation: readonly NavLink[];
  readonly services: ServicesContent;
  readonly logo: ImageAsset;
}

export function Footer({ content, site, navigation, services, logo }: FooterProps) {
  const { contact, location } = site;
  const year = new Date().getFullYear();

  return (
    <footer id={content.id} className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand} data-reveal="">
            <img
              className={styles.logo}
              src={logo.src}
              alt={content.logoAlt}
              width={logo.width}
              height={logo.height}
              loading="lazy"
              decoding="async"
            />
            <p className={styles.description}>{site.description}</p>
            <ul className={styles.social} aria-label={content.social.label} role="list">
              {site.social.linkedin ? (
                <li>
                  <a className={styles.socialLink} href={site.social.linkedin} aria-label={`${content.social.linkedin} ${content.newTabHint}`} {...EXTERNAL_LINK}>
                    <LineIcon shapes={LINKEDIN} className={styles.socialIcon} strokeWidth={2} />
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  className={styles.socialLink}
                  href={whatsappHref(contact.whatsapp.number, contact.whatsapp.message)}
                  aria-label={`${content.social.whatsapp} ${content.newTabHint}`}
                  {...EXTERNAL_LINK}
                  {...trackingAttributes(ANALYTICS_EVENTS.whatsappClick, "footer")}
                >
                  <ContactIcon name="whatsapp" className={styles.socialIcon} strokeWidth={2} />
                </a>
              </li>
            </ul>
          </div>

          <nav className={styles.column} aria-label={content.navigationLabel} data-reveal="">
            <h2 className={styles.heading}>{content.headings.navigation}</h2>
            <ul className={styles.links} role="list">
              {navigation.map((link) => (
                <li key={link.id}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.column} data-reveal="">
            <h2 className={styles.heading}>{content.headings.services}</h2>
            <ul className={styles.links} role="list">
              {footerServiceLinks(services).map((link) => (
                <li key={link.label}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.contactColumn}`} data-reveal="">
            <h2 className={styles.heading}>{content.headings.contact}</h2>
            <address className={styles.contact}>
              <p>
                <a
                  className={styles.contactValue}
                  href={emailHref(contact.email)}
                  {...trackingAttributes(ANALYTICS_EVENTS.emailClick, "footer")}
                >
                  {contact.email}
                </a>
                <span className={styles.contactNote}>{contact.emailResponseTime}</span>
              </p>
              <p>
                <a
                  className={styles.contactValue}
                  href={phoneHref(contact.phone.e164)}
                  {...trackingAttributes(ANALYTICS_EVENTS.phoneClick, "footer")}
                >
                  {contact.phone.display}
                </a>
                <span className={styles.contactNote}>
                  {content.contactLabels.phoneNote} · {contact.hours.label}
                </span>
              </p>
              <p>
                <span className={styles.contactValue}>{officesInline(location.offices)}</span>
                <span className={styles.contactNote}>{location.serviceArea}</span>
              </p>
            </address>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>{copyrightLine(year, site.name, content.rights)}</p>
          <div className={styles.legal}>
            <a className={styles.legalLink} href={PRIVACY_PATH}>
              {content.privacyLink}
            </a>
            <button type="button" className={styles.legalLink} {...{ [CONSENT_OPEN_ATTRIBUTE]: "" }}>
              {content.consentLink}
            </button>
          </div>
          <p>
            {content.credit.prefix}{" "}
            <a className={styles.credit} href={content.credit.href} {...EXTERNAL_LINK}>
              {content.credit.label}
              <span className="visually-hidden"> {content.newTabHint}</span>
            </a>
          </p>
        </div>
      </div>
      <ScrollReveal rootId={content.id} />
    </footer>
  );
}
