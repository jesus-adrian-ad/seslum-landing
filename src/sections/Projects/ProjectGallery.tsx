"use client";

/**
 * Galería de Proyectos por línea de servicio: pestañas WAI-ARIA y una ventana
 * para ver cada foto en grande.
 *
 * Una sola parada de Tab en la lista (tabindex itinerante), flechas en ambos
 * ejes, Inicio y Fin, y activación automática al moverse. Los seis paneles
 * viven en el HTML estático y solo el activo se muestra; las fotos van con
 * loading="lazy", así el navegador solo descarga las de la pestaña abierta.
 *
 * Cada foto es un botón que abre un <dialog> modal con la foto completa, su pie
 * y la posición ("3 de 5"); las flechas del teclado y los botones recorren las
 * fotos de esa línea, Esc o un clic fuera cierran y el navegador devuelve el
 * foco a la foto. La ventana no pide ninguna imagen hasta que se abre. En móvil
 * la tira de pestañas se desliza y centra la elegida; las medidas solo se leen
 * después de una elección del visitante, nunca al cargar.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ServiceIcon } from "@/components/ServiceIcon/ServiceIcon";
import { closeOnBackdrop } from "@/lib/dialog";
import { formatPhotoCounter } from "@/lib/projects-content";
import { nextTabIndex } from "@/lib/tabs";
import type { ProjectService, ProjectsLightboxLabels } from "@/types/content";
import styles from "./Projects.module.css";

const TILE_SIZES = "(min-width: 1182px) 280px, (min-width: 860px) 24vw, 50vw";
const FEATURED_TILE_SIZES = "(min-width: 1182px) 570px, (min-width: 860px) 48vw, 100vw";
const LIGHTBOX_SIZES = "(min-width: 1120px) 1088px, calc(100vw - 32px)";

interface OpenPhoto {
  readonly service: number;
  readonly photo: number;
}

export interface ProjectGalleryProps {
  readonly idPrefix: string;
  readonly tabsLabel: string;
  readonly enlargeHint: string;
  readonly lightbox: ProjectsLightboxLabels;
  readonly services: readonly ProjectService[];
}

export function ProjectGallery({ idPrefix, tabsLabel, enlargeHint, lightbox, services }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState<OpenPhoto | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedByUser = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!selectedByUser.current || !list || !tab || list.scrollWidth <= list.clientWidth) {
      return;
    }
    list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2 });
  }, [activeIndex]);

  const select = (index: number, moveFocus: boolean): void => {
    selectedByUser.current = true;
    setActiveIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const next = nextTabIndex(event.key, index, services.length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    select(next, true);
  };

  const openPhoto = (service: number, photo: number): void => {
    setOpen({ service, photo });
    dialogRef.current?.showModal();
  };

  const step = (delta: number): void => {
    setOpen((current) => {
      if (current === null) {
        return current;
      }
      const total = services[current.service]?.photos.length ?? 1;
      return { service: current.service, photo: (current.photo + delta + total) % total };
    });
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const openService = open === null ? undefined : services[open.service];
  const openImage = open === null ? undefined : openService?.photos[open.photo];

  return (
    <div className={styles.gallery} data-reveal="">
      <div ref={listRef} className={styles.list} role="tablist" aria-label={tabsLabel}>
        {services.map((service, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={service.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${idPrefix}-tab-${service.id}`}
              className={styles.tab}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${service.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index, false)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              <ServiceIcon name={service.icon} className={styles.tabIcon} />
              <span>{service.label}</span>
            </button>
          );
        })}
      </div>

      {services.map((service, serviceIndex) => (
        <div
          key={service.id}
          id={`${idPrefix}-panel-${service.id}`}
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-tab-${service.id}`}
          hidden={serviceIndex !== activeIndex}
        >
          <h3 className={styles.panelName}>{service.name}</h3>
          <ul className={styles.grid}>
            {service.photos.map((photo, photoIndex) => (
              <li key={photo.src} className={styles.item}>
                <button type="button" className={styles.tile} aria-haspopup="dialog" onClick={() => openPhoto(serviceIndex, photoIndex)}>
                  <img
                    className={styles.image}
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes={photoIndex === 0 ? FEATURED_TILE_SIZES : TILE_SIZES}
                    width={photo.width}
                    height={photo.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.caption}>
                    <span className="visually-hidden">{enlargeHint} </span>
                    {photo.caption}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={openService?.name}
        onClose={() => setOpen(null)}
        onClick={closeOnBackdrop}
        onKeyDown={onDialogKeyDown}
      >
        <figure className={styles.viewer}>
          {openImage === undefined || open === null || openService === undefined ? null : (
            <>
              <img
                className={styles.viewerImage}
                src={openImage.src}
                srcSet={openImage.srcSet}
                sizes={LIGHTBOX_SIZES}
                width={openImage.width}
                height={openImage.height}
                alt={openImage.caption}
              />
              <figcaption className={styles.viewerBar}>
                <button type="button" className={styles.viewerButton} aria-label={lightbox.previousLabel} onClick={() => step(-1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <span className={styles.viewerText}>
                  <span className={styles.viewerCaption}>{openImage.caption}</span>
                  <span className={styles.viewerCounter}>
                    {formatPhotoCounter(lightbox.counter, open.photo + 1, openService.photos.length)}
                  </span>
                </span>
                <button type="button" className={styles.viewerButton} aria-label={lightbox.nextLabel} onClick={() => step(1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.viewerButton}
                  aria-label={lightbox.closeLabel}
                  onClick={() => dialogRef.current?.close()}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </figcaption>
            </>
          )}
        </figure>
      </dialog>
    </div>
  );
}
