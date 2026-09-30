"use client";

/**
 * Entrada al hacer scroll para cualquier sección.
 *
 * La sección marca con data-reveal lo que debe entrar y con data-draw los
 * íconos cuyo trazo se dibuja. El contenido se renderiza visible: este
 * componente solo lo oculta y lo anima cuando GSAP ya cargó, el visitante no
 * pidió reducir el movimiento y el elemento aún está fuera de pantalla. Sin
 * JavaScript, o con movimiento reducido, la sección se ve completa desde el inicio.
 *
 * Se oculta con opacity y no con visibility: así el contenido pendiente sigue en
 * el árbol de accesibilidad y un lector de pantalla puede recorrerlo antes de
 * que el visitante haga scroll.
 *
 * Cada elemento animado lleva data-reveal-state ("pending" mientras espera,
 * "revealed" al entrar), para que las secciones encadenen efectos propios en CSS
 * sin tocar este componente. Sin ese atributo, el CSS debe mostrar el estado final.
 */

import { useEffect } from "react";
import {
  DOT_SELECTOR,
  ICON_SELECTOR,
  REVEAL_SELECTOR,
  REVEAL_START,
  REVEAL_STATE_ATTRIBUTE,
  STROKE_SELECTOR,
  pendingReveals,
} from "@/lib/reveal";
import { useMotionModule, type MotionModule } from "@/lib/use-motion";

const ENTER_DISTANCE_PX = 28;
const DRAW_DELAY_S = 0.2;
const DRAW_STEP_S = 0.14;
const DOT_AFTER_STROKE_RATIO = 0.6;
const BATCH_STEP_S = 0.12;

export interface ScrollRevealProps {
  readonly rootId: string;
}

function drawIcons(motion: MotionModule, element: Element, timeline: gsap.core.Timeline): void {
  const { MOTION } = motion;
  element.querySelectorAll(ICON_SELECTOR).forEach((icon, index) => {
    const at = DRAW_DELAY_S + index * DRAW_STEP_S;
    const strokes = icon.querySelectorAll(STROKE_SELECTOR);
    const dots = icon.querySelectorAll(DOT_SELECTOR);
    if (strokes.length > 0) {
      timeline.to(
        strokes,
        { strokeDashoffset: 0, duration: MOTION.durationSlow, ease: MOTION.easeInOut, stagger: MOTION.stagger },
        at,
      );
    }
    if (dots.length > 0) {
      timeline.to(
        dots,
        { opacity: 1, scale: 1, duration: MOTION.durationFast, ease: MOTION.easeOut },
        at + MOTION.durationSlow * DOT_AFTER_STROKE_RATIO,
      );
    }
  });
}

function hideIcons(motion: MotionModule, element: Element): void {
  const { gsap } = motion;
  const strokes = element.querySelectorAll(`${ICON_SELECTOR} ${STROKE_SELECTOR}`);
  const dots = element.querySelectorAll(`${ICON_SELECTOR} ${DOT_SELECTOR}`);
  if (strokes.length > 0) {
    gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
  }
  if (dots.length > 0) {
    gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
  }
}

export function ScrollReveal({ rootId }: ScrollRevealProps): null {
  const motion = useMotionModule();

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!motion || !root) {
      return undefined;
    }
    const { gsap, ScrollTrigger, MOTION, MOTION_CONDITIONS } = motion;
    const context = gsap.context(() => {
      gsap.matchMedia().add(MOTION_CONDITIONS.motionOk, () => {
        const candidates = gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR, root);
        const pending = pendingReveals(candidates, (element) => element.getBoundingClientRect().top, window.innerHeight);
        if (pending.length === 0) {
          return;
        }
        gsap.set(pending, { opacity: 0, y: ENTER_DISTANCE_PX });
        for (const element of pending) {
          element.setAttribute(REVEAL_STATE_ATTRIBUTE, "pending");
          hideIcons(motion, element);
        }
        ScrollTrigger.batch(pending, {
          start: REVEAL_START,
          once: true,
          onEnter: (batch) => {
            batch.forEach((element, index) => {
              element.setAttribute(REVEAL_STATE_ATTRIBUTE, "revealed");
              const timeline = gsap.timeline({ delay: index * BATCH_STEP_S });
              timeline.to(element, { opacity: 1, y: 0, duration: MOTION.durationSlow, ease: MOTION.easeOut }, 0);
              drawIcons(motion, element, timeline);
            });
          },
        });
        return () => {
          for (const element of pending) {
            element.removeAttribute(REVEAL_STATE_ATTRIBUTE);
          }
        };
      });
    }, root);
    return () => context.revert();
  }, [motion, rootId]);

  return null;
}
