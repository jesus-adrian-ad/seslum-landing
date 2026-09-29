/**
 * Sistema de movimiento del sitio: registro único de GSAP y sus plugins, y los
 * valores de animación compartidos por todas las secciones.
 *
 * Toda animación se declara dentro de una condición de gsap.matchMedia, así el
 * movimiento se apaga solo cuando el visitante pide reducirlo en su sistema.
 */

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export { gsap, ScrollTrigger, useGSAP };
