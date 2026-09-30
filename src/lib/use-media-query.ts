"use client";

/**
 * Estado de una media query sincronizado con React.
 *
 * En el servidor y durante la hidratación responde false, igual que el HTML
 * estático; justo después toma el valor real del navegador sin provocar un
 * desajuste de hidratación.
 */

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
