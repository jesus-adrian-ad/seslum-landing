"use client";

/**
 * Mensaje del director en el encabezado: una tarjeta con la miniatura del video
 * que lo abre en una ventana modal (<dialog> nativo).
 *
 * El video no se descarga con la página: lleva preload="none" y el póster se
 * asigna hasta que alguien abre la ventana, así el encabezado solo carga la
 * miniatura, y esta va con loading="lazy" para que React no la precargue y no
 * compita con la foto del encabezado, que es el LCP. La ventana se abre y el video arranca dentro del mismo clic, porque
 * Safari en iPhone solo deja reproducir con sonido si play() ocurre en el gesto
 * del usuario. Al cerrar (Esc, la equis o un clic fuera) se detiene y vuelve al
 * inicio. Los subtítulos vienen grabados en el video. Abrirlo publica
 * video_start con source "hero".
 */

import { useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { closeOnBackdrop } from "@/lib/dialog";
import type { HeroVideo as HeroVideoContent } from "@/types/content";
import styles from "./HeroVideo.module.css";

export interface HeroVideoProps {
  readonly content: HeroVideoContent;
}

export function HeroVideo({ content }: HeroVideoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opened, setOpened] = useState(false);

  const open = (): void => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) {
      return;
    }
    setOpened(true);
    dialog.showModal();
    trackEvent(ANALYTICS_EVENTS.videoStart, { source: "hero", video_title: content.label });
    void video.play().catch(() => undefined);
  };

  const close = (): void => {
    dialogRef.current?.close();
  };

  const stop = (): void => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <>
      <button type="button" className={`chamfer-frame ${styles.card}`} aria-haspopup="dialog" onClick={open}>
        <span className={styles.thumb}>
          <img
            className={styles.thumbImage}
            src={content.thumbnail.src}
            width={content.thumbnail.width}
            height={content.thumbnail.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className={styles.play} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          </span>
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{content.label}</span>
          <span className={styles.meta}>{content.meta}</span>
        </span>
      </button>

      <dialog ref={dialogRef} className={styles.dialog} aria-label={content.title} onClose={stop} onClick={closeOnBackdrop}>
        <div className={styles.frame}>
          <video
            ref={videoRef}
            className={styles.video}
            src={content.src}
            poster={opened ? content.poster.src : undefined}
            width={content.poster.width}
            height={content.poster.height}
            preload="none"
            controls
            playsInline
          />
          <button type="button" className={styles.close} aria-label={content.closeLabel} onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </dialog>
    </>
  );
}
