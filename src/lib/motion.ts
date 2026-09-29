/**
 * Sistema de movimiento del sitio: registro único de GSAP y sus plugins, y los
 * valores de animación compartidos por todas las secciones.
 *
 * Este módulo se carga de forma diferida (ver use-motion.ts). Toda animación se
 * declara dentro de gsap.context para limpiarse al desmontar, y respeta
 * prefers-reduced-motion mediante gsap.matchMedia o MOTION_CONDITIONS.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const MOTION_CONDITIONS = {
  motionOk: "(prefers-reduced-motion: no-preference)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

export const MOTION = {
  easeOut: "power3.out",
  easeInOut: "power3.inOut",
  easeExpo: "expo.out",
  durationFast: 0.25,
  durationBase: 0.45,
  durationSlow: 0.8,
  stagger: 0.06,
} as const;

export { gsap, ScrollTrigger };
