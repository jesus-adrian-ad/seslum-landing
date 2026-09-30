/**
 * Reglas de la entrada al hacer scroll, sin dependencias del navegador.
 *
 * Solo se ocultan para animarlos los elementos que todavía no se ven cuando
 * GSAP termina de cargar: lo que el visitante ya tiene en pantalla nunca
 * parpadea ni desaparece para volver a entrar.
 */

export const REVEAL_SELECTOR = "[data-reveal]";
export const ICON_SELECTOR = "[data-draw]";
export const STROKE_SELECTOR = "[pathLength]";
export const DOT_SELECTOR = "[data-dot]";
export const REVEAL_START = "top 90%";
export const REVEAL_STATE_ATTRIBUTE = "data-reveal-state";

export function isBelowViewport(elementTop: number, viewportHeight: number): boolean {
  return elementTop >= viewportHeight;
}

export function pendingReveals<T>(elements: readonly T[], topOf: (element: T) => number, viewportHeight: number): T[] {
  return elements.filter((element) => isBelowViewport(topOf(element), viewportHeight));
}
