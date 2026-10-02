/**
 * Botón flotante de WhatsApp, fijo abajo a la derecha y visible desde la carga.
 *
 * El texto de la etiqueta es su nombre accesible: siempre está en el DOM y solo
 * se muestra al pasar el cursor o con foco de teclado. Entra con una escala
 * suave y un anillo que pulsa pocas veces; con movimiento reducido aparece sin
 * animación. Es HTML estático; ClickTracker publica click_whatsapp con source
 * "floating".
 */

import { ContactIcon } from "@/components/ContactIcon/ContactIcon";
import { ANALYTICS_EVENTS, trackingAttributes } from "@/lib/analytics";
import { whatsappHref } from "@/lib/contact-links";
import type { WhatsAppContact } from "@/types/content";
import styles from "./WhatsAppFloat.module.css";

const ICON_STROKE_WIDTH = 2;

export interface WhatsAppFloatProps {
  readonly whatsapp: WhatsAppContact;
  readonly label: string;
  readonly newTabHint: string;
}

export function WhatsAppFloat({ whatsapp, label, newTabHint }: WhatsAppFloatProps) {
  return (
    <a
      href={whatsappHref(whatsapp.number, whatsapp.message)}
      className={styles.float}
      target="_blank"
      rel="noopener noreferrer"
      {...trackingAttributes(ANALYTICS_EVENTS.whatsappClick, "floating")}
    >
      <ContactIcon name="whatsapp" className={styles.icon} strokeWidth={ICON_STROKE_WIDTH} />
      <span className={styles.label}>
        {label}
        <span className="visually-hidden"> {newTabHint}</span>
      </span>
    </a>
  );
}
