/**
 * Carga diferida de imágenes que no participan en el primer pintado, como las
 * fotos 2 a 6 del carrusel del encabezado.
 *
 * El servidor las renderiza con las URLs en atributos data-deferred-*; así el
 * navegador no las pide mientras descarga la foto LCP, aunque estén dentro de
 * la pantalla (con loading="lazy" se pedirían igual, porque están en viewport).
 * Al terminar la carga de la página, el cliente pasa esos valores a srcset y
 * src. srcset va antes que src para que el navegador elija el ancho correcto a
 * la primera, sin descargar también la URL de respaldo.
 *
 * No se cargan con movimiento reducido (el carrusel no corre y solo se ve la
 * primera foto) ni con ahorro de datos activado. Sin JavaScript tampoco: las
 * capas vacías son transparentes y dejan ver la primera foto, que siempre está.
 */

export const DEFERRED_SRC_ATTR = "data-deferred-src";
export const DEFERRED_SRCSET_ATTR = "data-deferred-srcset";
export const DEFERRED_MEDIA_SELECTOR = `[${DEFERRED_SRCSET_ATTR}], [${DEFERRED_SRC_ATTR}]`;

const PROMOTIONS = [
  [DEFERRED_SRCSET_ATTR, "srcset"],
  [DEFERRED_SRC_ATTR, "src"],
] as const;

export interface AttributeTarget {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export interface DeferredMediaConditions {
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
}

export function shouldLoadDeferredMedia({ reducedMotion, saveData }: DeferredMediaConditions): boolean {
  return !reducedMotion && !saveData;
}

export function promoteDeferredSources(elements: Iterable<AttributeTarget>): number {
  let promoted = 0;
  for (const element of elements) {
    for (const [deferred, real] of PROMOTIONS) {
      const value = element.getAttribute(deferred);
      if (value !== null) {
        element.setAttribute(real, value);
        element.removeAttribute(deferred);
        promoted += 1;
      }
    }
  }
  return promoted;
}
