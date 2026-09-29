"use client";

/**
 * Carga diferida del sistema de movimiento.
 *
 * GSAP no viaja en el JavaScript inicial: se descarga cuando la página terminó
 * de cargar y el hilo principal quedó libre, para que ni el primer pintado ni el
 * LCP compitan con su evaluación. Mientras no ha cargado, los componentes
 * funcionan igual pero sin animación (la entrada de las secciones es CSS).
 */

import { useEffect, useState } from "react";

export type MotionModule = typeof import("@/lib/motion");

const IDLE_TIMEOUT_MS = 2000;

let motionPromise: Promise<MotionModule> | null = null;

function afterLoadAndIdle(): Promise<void> {
  return new Promise((resolve) => {
    const whenIdle = (): void => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => resolve(), { timeout: IDLE_TIMEOUT_MS });
      } else {
        window.setTimeout(resolve, 0);
      }
    };
    if (document.readyState === "complete") {
      whenIdle();
    } else {
      window.addEventListener("load", whenIdle, { once: true });
    }
  });
}

export function loadMotion(): Promise<MotionModule> {
  motionPromise ??= afterLoadAndIdle().then(() => import("@/lib/motion"));
  return motionPromise;
}

export function useMotionModule(): MotionModule | null {
  const [motion, setMotion] = useState<MotionModule | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadMotion().then((loaded) => {
      if (!cancelled) {
        setMotion(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return motion;
}
