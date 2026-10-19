"use client";

/**
 * Ventana de confirmación del formulario: se abre cuando el servidor confirma el
 * envío y avisa que el equipo responderá en breve.
 *
 * Usa el <dialog> nativo en modo modal: bloquea la página de fondo, lleva el foco
 * al botón de cerrar, se cierra con Esc o con un clic fuera del cuadro y al
 * cerrarse devuelve el foco a donde estaba. El ícono dibuja primero el círculo y
 * luego la palomita, solo con CSS; con movimiento reducido aparece completo.
 */

import { useEffect, useId, useRef } from "react";
import { closeOnBackdrop } from "@/lib/dialog";
import styles from "./SuccessDialog.module.css";

export interface SuccessDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly body: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

export function SuccessDialog({ open, title, body, closeLabel, onClose }: SuccessDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const bodyId = `${baseId}-body`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const close = (): void => {
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onClose={onClose}
      onClick={closeOnBackdrop}
    >
      <div className={`chamfer-frame ${styles.box}`}>
        <svg className={styles.icon} viewBox="0 0 48 48" aria-hidden="true">
          <circle className={styles.ring} cx="24" cy="24" r="21" pathLength={1} />
          <path className={styles.check} d="M14.5 24.5l6.5 6.5 13-14" pathLength={1} />
        </svg>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={bodyId} className={styles.body}>
          {body}
        </p>
        <button ref={closeRef} type="button" className={styles.close} onClick={close}>
          {closeLabel}
        </button>
        <button type="button" className={styles.dismiss} aria-label={closeLabel} onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}
