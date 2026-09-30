/**
 * Navegación con teclado de una lista de pestañas (patrón WAI-ARIA Tabs).
 *
 * Las flechas avanzan o retroceden de forma circular y aceptan ambos ejes,
 * porque la misma lista es horizontal en móvil y vertical en escritorio; Inicio
 * y Fin llevan a los extremos. Cualquier otra tecla no mueve la selección.
 */

const NEXT_KEYS: ReadonlySet<string> = new Set(["ArrowRight", "ArrowDown"]);
const PREVIOUS_KEYS: ReadonlySet<string> = new Set(["ArrowLeft", "ArrowUp"]);

export function nextTabIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) {
    return null;
  }
  if (NEXT_KEYS.has(key)) {
    return (current + 1) % count;
  }
  if (PREVIOUS_KEYS.has(key)) {
    return (current - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return null;
}
