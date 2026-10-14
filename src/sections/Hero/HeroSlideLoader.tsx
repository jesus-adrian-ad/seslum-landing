"use client";

/**
 * Carga las fotos 2 a 6 del carrusel del encabezado cuando la página terminó de
 * cargar, para que no compitan con la foto LCP. Las reglas (qué atributos, en
 * qué orden y cuándo no cargar) viven en lib/deferred-media; este componente
 * solo las conecta con el DOM y el evento load. No renderiza nada.
 */

import { useEffect } from "react";
import { DEFERRED_MEDIA_SELECTOR, promoteDeferredSources, shouldLoadDeferredMedia } from "@/lib/deferred-media";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface NetworkInformationLike {
  readonly saveData?: boolean;
}

export interface HeroSlideLoaderProps {
  readonly sectionId: string;
}

export function HeroSlideLoader({ sectionId }: HeroSlideLoaderProps): null {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    const allowed = shouldLoadDeferredMedia({
      reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
      saveData: connection?.saveData === true,
    });
    if (!section || !allowed) {
      return undefined;
    }
    const load = () => {
      promoteDeferredSources(section.querySelectorAll(DEFERRED_MEDIA_SELECTOR));
    };
    if (document.readyState === "complete") {
      load();
      return undefined;
    }
    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, [sectionId]);

  return null;
}
