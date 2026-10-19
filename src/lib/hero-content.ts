/**
 * Validación del contenido del encabezado durante el build estático.
 *
 * El carrusel de fondo es CSS puro: los tiempos de cada foto viven en los
 * keyframes de Hero.module.css, calculados para exactamente HERO_SLIDE_COUNT
 * fotos. Una foto de más o de menos rompería la secuencia sin ningún error
 * visible, así que el build falla antes. También exige ids únicos, porque son
 * la key de React de cada foto. Del video del director exige un .mp4 servido
 * desde /videos/ (la CSP solo permite medios del propio sitio) y textos no
 * vacíos, porque son el nombre accesible del botón y de la ventana.
 */

import type { HeroContent } from "@/types/content";

export const HERO_SLIDE_COUNT = 6;

const VIDEO_PATH = /^\/videos\/[a-z0-9-]+\.mp4$/;

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
  const { video } = raw;
  if (!VIDEO_PATH.test(video.src)) {
    throw new Error(`hero.json: video.src debe ser un .mp4 dentro de /videos/ (tiene "${video.src}").`);
  }
  for (const field of ["label", "title", "closeLabel"] as const) {
    if (video[field].trim() === "") {
      throw new Error(`hero.json: video.${field} no puede estar vacío; es el nombre accesible del botón o de la ventana.`);
    }
  }
  if (raw.media.alt.trim() === "") {
    throw new Error("hero.json: media.alt no puede estar vacío; describe las fotos para lectores de pantalla.");
  }
  return raw;
}
