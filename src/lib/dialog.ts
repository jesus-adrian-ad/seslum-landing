/**
 * Utilidades de las ventanas modales del sitio (<dialog> nativo con showModal).
 *
 * Esc y la devolución del foco al cerrar los resuelve el navegador; lo único que
 * falta en el elemento nativo es cerrar con un clic fuera del cuadro. Cada
 * ventana pinta su contenido en un hijo que ocupa todo el <dialog>, así que un
 * clic cuyo destino es el propio <dialog> solo puede venir del fondo.
 */

import type { MouseEvent } from "react";

export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>): void {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
}
