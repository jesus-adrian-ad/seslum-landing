/**
 * Validación del contenido del encabezado durante el build estático.
 *
 * El carrusel de fondo es CSS puro: los tiempos de cada foto viven en los
 * keyframes de Hero.module.css, calculados para exactamente HERO_SLIDE_COUNT
 * fotos. Una foto de más o de menos rompería la secuencia sin ningún error
 * visible, así que el build falla antes. También exige ids únicos, porque son
 * la key de React de cada foto.
 */

import type { HeroContent } from "@/types/content";

export const HERO_SLIDE_COUNT = 6;

export function parseHeroContent(raw: HeroContent): HeroContent {
  const { slides } = raw.media;
  if (slides.length !== HERO_SLIDE_COUNT) {
    throw new Error(
      `hero.json: media.slides necesita exactamente ${HERO_SLIDE_COUNT} fotos (tiene ${slides.length}); los tiempos del carrusel están calculados para ese número.`,
    );
  }
  const seen = new Set<string>();
  for (const slide of slides) {
    if (seen.has(slide.id)) {
      throw new Error(`hero.json: el id de foto "${slide.id}" está repetido.`);
    }
    seen.add(slide.id);
  }
  if (raw.media.alt.trim() === "") {
    throw new Error("hero.json: media.alt no puede estar vacío; describe las fotos para lectores de pantalla.");
  }
  return raw;
}
