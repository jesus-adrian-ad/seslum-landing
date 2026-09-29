"use client";

/**
 * Parallax del encabezado al hacer scroll: la foto baja más lento que la página
 * y el contenido se desvanece al salir. Solo corre si el visitante no pidió
 * reducir el movimiento, y cuando GSAP ya cargó; no renderiza nada.
 */

import { useEffect } from "react";
import { useMotionModule } from "@/lib/use-motion";

const MEDIA_SHIFT_PERCENT = 14;
const CONTENT_SHIFT_PX = -56;
const CONTENT_END_OPACITY = 0.2;

export interface HeroScrollEffectsProps {
  readonly sectionId: string;
}

export function HeroScrollEffects({ sectionId }: HeroScrollEffectsProps): null {
  const motion = useMotionModule();

  useEffect(() => {
    const section = document.getElementById(sectionId);
    const media = section?.querySelector<HTMLElement>("[data-hero-media]");
    const content = section?.querySelector<HTMLElement>("[data-hero-content]");
    if (!motion || !section || !media || !content) {
      return undefined;
    }
    const { gsap, MOTION_CONDITIONS } = motion;
    const context = gsap.context(() => {
      gsap.matchMedia().add(MOTION_CONDITIONS.motionOk, () => {
        const scrollTrigger = { trigger: section, start: "top top", end: "bottom top", scrub: true };
        gsap.to(media, { yPercent: MEDIA_SHIFT_PERCENT, ease: "none", scrollTrigger });
        gsap.to(content, { y: CONTENT_SHIFT_PX, opacity: CONTENT_END_OPACITY, ease: "none", scrollTrigger });
      });
    }, section);
    return () => context.revert();
  }, [motion, sectionId]);

  return null;
}
