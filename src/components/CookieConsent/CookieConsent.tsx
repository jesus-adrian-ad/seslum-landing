"use client";

/**
 * Banner de consentimiento de cookies con Consent Mode v2.
 *
 * Aparece solo si el visitante no ha decidido o si su decisión venció (12
 * meses), y se monta después de hidratar: no compite con el LCP y, al ser fijo,
 * no mueve el contenido. Ofrece Aceptar todo, Rechazar y Configurar con el mismo
 * peso; en Configurar, Analítica y Publicidad son interruptores y Necesarias va
 * siempre activa. Cualquier control con CONSENT_OPEN_ATTRIBUTE (el enlace del
 * pie) vuelve a abrir las preferencias y recibe el foco de regreso al cerrar.
 *
 * No es un modal: es una región con título que no bloquea la página. Mientras
 * está visible publica su alto en --consent-offset para que el botón flotante de
 * WhatsApp suba en móvil. El texto enlaza al aviso de privacidad.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ACCEPTED_PREFERENCES, type ConsentPreferences, DENIED_PREFERENCES } from "@/lib/consent";
import { CONSENT_OPEN_ATTRIBUTE, readStoredConsent, saveConsent } from "@/lib/consent-runtime";
import { PRIVACY_PATH } from "@/lib/privacy";
import type { ConsentContent } from "@/types/content";
import styles from "./CookieConsent.module.css";

type View = "closed" | "banner" | "settings";

type ToggleableCategory = keyof ConsentPreferences;

const OFFSET_PROPERTY = "--consent-offset";
const VISIBLE_ATTRIBUTE = "data-consent-banner";
const OPEN_SELECTOR = `[${CONSENT_OPEN_ATTRIBUTE}]`;

export interface CookieConsentProps {
  readonly content: ConsentContent;
}

export function CookieConsent({ content }: CookieConsentProps) {
  const [view, setView] = useState<View>("closed");
  const [draft, setDraft] = useState<ConsentPreferences>(DENIED_PREFERENCES);
  const rootRef = useRef<HTMLElement>(null);
  const settingsTitleRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  const openSettings = useCallback((opener: HTMLElement | null) => {
    openerRef.current = opener;
    setDraft(readStoredConsent() ?? DENIED_PREFERENCES);
    setView("settings");
  }, []);

  const decide = useCallback((preferences: ConsentPreferences) => {
    saveConsent(preferences);
    setView("closed");
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (readStoredConsent() === null) {
        setView("banner");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const opener = event.target.closest<HTMLElement>(OPEN_SELECTOR);
      if (opener) {
        event.preventDefault();
        openSettings(opener);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openSettings]);

  useEffect(() => {
    if (view === "settings" && openerRef.current) {
      settingsTitleRef.current?.focus();
    }
  }, [view]);

  useEffect(() => {
    const root = document.documentElement;
    const banner = rootRef.current;
    if (view === "closed" || !banner) {
      root.removeAttribute(VISIBLE_ATTRIBUTE);
      root.style.removeProperty(OFFSET_PROPERTY);
      return undefined;
    }
    root.setAttribute(VISIBLE_ATTRIBUTE, "visible");
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize[0]?.blockSize ?? banner.offsetHeight;
      root.style.setProperty(OFFSET_PROPERTY, `${Math.ceil(height)}px`);
    });
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.removeAttribute(VISIBLE_ATTRIBUTE);
      root.style.removeProperty(OFFSET_PROPERTY);
    };
  }, [view]);

  if (view === "closed") {
    return null;
  }

  const toggle = (category: ToggleableCategory): void => {
    setDraft((current) => ({ ...current, [category]: !current[category] }));
  };

  const switchRow = (category: ToggleableCategory) => {
    const { name, description } = content.categories[category];
    const nameId = `${titleId}-${category}`;
    const descriptionId = `${nameId}-description`;
    return (
      <li className={styles.category} key={category}>
        <div>
          <p id={nameId} className={styles.categoryName}>
            {name}
          </p>
          <p id={descriptionId} className={styles.categoryDescription}>
            {description}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={draft[category]}
          aria-labelledby={nameId}
          aria-describedby={descriptionId}
          className={styles.switch}
          onClick={() => toggle(category)}
        >
          <span className={styles.thumb} />
        </button>
      </li>
    );
  };

  return (
    <section
      ref={rootRef}
      className={`chamfer-frame ${styles.banner}`}
      aria-labelledby={titleId}
      aria-describedby={view === "banner" ? bodyId : undefined}
      data-view={view}
    >
      {view === "banner" ? (
        <>
          <h2 id={titleId} className={styles.title}>
            {content.title}
          </h2>
          <p id={bodyId} className={styles.body}>
            {content.body} <a href={PRIVACY_PATH}>{content.privacyLink}</a>
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => decide(ACCEPTED_PREFERENCES)}>
              {content.actions.acceptAll}
            </button>
            <button type="button" className={styles.secondary} onClick={() => decide(DENIED_PREFERENCES)}>
              {content.actions.reject}
            </button>
            <button type="button" className={styles.secondary} onClick={() => openSettings(null)}>
              {content.actions.settings}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 id={titleId} ref={settingsTitleRef} tabIndex={-1} className={styles.title}>
            {content.settingsTitle}
          </h2>
          <ul className={styles.categories} role="list">
            <li className={styles.category}>
              <div>
                <p className={styles.categoryName}>{content.categories.necessary.name}</p>
                <p className={styles.categoryDescription}>{content.categories.necessary.description}</p>
              </div>
              <span className={styles.alwaysOn}>{content.alwaysOn}</span>
            </li>
            {switchRow("analytics")}
            {switchRow("advertising")}
          </ul>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => decide(draft)}>
              {content.actions.save}
            </button>
            <button type="button" className={styles.secondary} onClick={() => decide(ACCEPTED_PREFERENCES)}>
              {content.actions.acceptAll}
            </button>
            <button type="button" className={styles.secondary} onClick={() => decide(DENIED_PREFERENCES)}>
              {content.actions.reject}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
