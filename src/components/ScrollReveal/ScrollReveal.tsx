"use client";

/**
 * Entrada al hacer scroll para las secciones que se le indican.
 *
 * Se monta una sola vez en la página y recibe los ids de las secciones. Mide
 * todas antes de modificar ninguna, crea los disparadores (uno por sección, para
 * que el escalonado de un salto largo no se acumule) mientras el layout sigue
 * limpio y solo al final marca los elementos. No anima nada durante la carga: el estado oculto lo pone el CSS global (base.css) a
 * partir de data-reveal-state="pending". GSAP interviene cuando cada elemento
 * entra en pantalla, con fromTo. Si ocultara con gsap.set, GSAP leería y
 * escribiría el transform de cada elemento al iniciar, y esas decenas de
 * recálculos de estilo forzados son lo que Lighthouse penaliza (reflow forzado).
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
  readonly rootIds: readonly string[];
}

function drawIcons(motion: MotionModule, element: Element, timeline: gsap.core.Timeline): void {
  const { MOTION } = motion;
  element.querySelectorAll(ICON_SELECTOR).forEach((icon, index) => {
    const at = DRAW_DELAY_S + index * DRAW_STEP_S;
    const strokes = icon.querySelectorAll(STROKE_SELECTOR);
    const dots = icon.querySelectorAll(DOT_SELECTOR);
    if (strokes.length > 0) {
      timeline.fromTo(
        strokes,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: MOTION.durationSlow, ease: MOTION.easeInOut, stagger: MOTION.stagger },
        at,
      );
    }
    if (dots.length > 0) {
      timeline.fromTo(
        dots,
        { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: MOTION.durationFast, ease: MOTION.easeOut },
        at + MOTION.durationSlow * DOT_AFTER_STROKE_RATIO,
      );
    }
  });
}

export function ScrollReveal({ rootIds }: ScrollRevealProps): null {
  const motion = useMotionModule();

  useEffect(() => {
    const roots = rootIds.flatMap((id) => {
      const root = document.getElementById(id);
      return root ? [root] : [];
    });
    if (!motion || roots.length === 0) {
      return undefined;
    }
    const { gsap, ScrollTrigger, MOTION, MOTION_CONDITIONS } = motion;
    const enter = (batch: Element[]): void => {
      batch.forEach((element, index) => {
        element.setAttribute(REVEAL_STATE_ATTRIBUTE, "revealed");
        const timeline = gsap.timeline({ delay: index * BATCH_STEP_S });
        timeline.fromTo(
          element,
          { opacity: 0, y: ENTER_DISTANCE_PX },
          { opacity: 1, y: 0, duration: MOTION.durationSlow, ease: MOTION.easeOut },
          0,
        );
        drawIcons(motion, element, timeline);
      });
    };
    const context = gsap.context(() => {
      gsap.matchMedia().add(MOTION_CONDITIONS.motionOk, () => {
        const topOf = (element: HTMLElement): number => element.getBoundingClientRect().top;
        const groups = roots
          .map((root) => pendingReveals(gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR, root), topOf, window.innerHeight))
          .filter((group) => group.length > 0);
        if (groups.length === 0) {
          return;
        }
        for (const group of groups) {
          ScrollTrigger.batch(group, { start: REVEAL_START, once: true, onEnter: enter });
        }
        const pending = groups.flat();
        for (const element of pending) {
          element.setAttribute(REVEAL_STATE_ATTRIBUTE, "pending");
        }
        return () => {
          for (const element of pending) {
            element.removeAttribute(REVEAL_STATE_ATTRIBUTE);
          }
        };
      });
    });
    return () => context.revert();
  }, [motion, rootIds]);

  return null;
}
