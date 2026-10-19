"use client";

/**
 * Botón flotante de WhatsApp, fijo abajo a la derecha y visible desde la carga.
 *
 * Al entrar se muestra extendido con la invitación ("¿Tiene dudas? Escríbanos
 * por mensaje"); con el primer desplazamiento hacia abajo se recoge y queda solo
 * el ícono, sin volver a extenderse al regresar arriba. Recogido, el texto sigue
 * en el DOM como nombre accesible y reaparece al pasar el cursor o con foco de
 * teclado. Solo escribe un atributo (`data-collapsed`) y lee `scrollY`, así que
 * no fuerza recálculos de layout; con movimiento reducido el cambio es
 * instantáneo. ClickTracker publica click_whatsapp con source "floating".
 */

import { useEffect, useRef } from "react";
import { ContactIcon } from "@/components/ContactIcon/ContactIcon";
import { ANALYTICS_EVENTS, trackingAttributes } from "@/lib/analytics";
import { whatsappHref } from "@/lib/contact-links";
import type { WhatsAppContact } from "@/types/content";
import styles from "./WhatsAppFloat.module.css";

const ICON_STROKE_WIDTH = 2;

export const COLLAPSE_SCROLL_PX = 48;

export interface WhatsAppFloatProps {
  readonly whatsapp: WhatsAppContact;
  readonly label: string;
  readonly channelHint: string;
  readonly newTabHint: string;
}

export function WhatsAppFloat({ whatsapp, label, channelHint, newTabHint }: WhatsAppFloatProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (link === null) {
      return undefined;
    }
    const collapseOnScroll = (): void => {
      if (window.scrollY > COLLAPSE_SCROLL_PX) {
        link.dataset.collapsed = "";
        window.removeEventListener("scroll", collapseOnScroll);
      }
    };
    collapseOnScroll();
    window.addEventListener("scroll", collapseOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", collapseOnScroll);
  }, []);

  return (
    <a
      ref={linkRef}
      href={whatsappHref(whatsapp.number, whatsapp.message)}
      className={styles.float}
      target="_blank"
      rel="noopener noreferrer"
      {...trackingAttributes(ANALYTICS_EVENTS.whatsappClick, "floating")}
    >
      <ContactIcon name="whatsapp" className={styles.icon} strokeWidth={ICON_STROKE_WIDTH} />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className="visually-hidden">
          {" "}
          {channelHint} {newTabHint}
        </span>
      </span>
    </a>
  );
}
