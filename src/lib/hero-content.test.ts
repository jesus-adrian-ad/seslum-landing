import { describe, expect, it } from "vitest";
import { hero } from "@/lib/content";
import type { HeroContent, HeroSlide } from "@/types/content";
import { HERO_SLIDE_COUNT, parseHeroContent } from "./hero-content";

const file = { src: "/a.webp", width: 430, height: 932 };
const slide = (id: string): HeroSlide => ({
  id,
  landscape: { ...file, srcSet: "/a.webp 430w" },
  portrait: { phone: file, tablet: file },
});
const withSlides = (slides: readonly HeroSlide[]): HeroContent => ({ ...hero, media: { ...hero.media, slides } });
const ids = (count: number) => Array.from({ length: count }, (_, index) => slide(`foto-${index}`));

describe("parseHeroContent", () => {
  it("acepta el contenido publicado", () => {
    expect(parseHeroContent(hero)).toEqual(hero);
    expect(hero.media.slides).toHaveLength(HERO_SLIDE_COUNT);
  });

  it("exige exactamente el número de fotos para el que están calculados los tiempos", () => {
    expect(() => parseHeroContent(withSlides(ids(HERO_SLIDE_COUNT - 1)))).toThrow(/exactamente 6 fotos \(tiene 5\)/);
    expect(() => parseHeroContent(withSlides(ids(HERO_SLIDE_COUNT + 1)))).toThrow(/tiene 7/);
  });

  it("rechaza ids repetidos", () => {
    const repeated = [...ids(HERO_SLIDE_COUNT - 1), slide("foto-0")];
    expect(() => parseHeroContent(withSlides(repeated))).toThrow(/"foto-0" está repetido/);
  });

  it("rechaza un texto alternativo vacío", () => {
    const blank: HeroContent = { ...hero, media: { ...hero.media, alt: "  " } };
    expect(() => parseHeroContent(blank)).toThrow(/media\.alt/);
  });

  it("exige que el video sea un .mp4 del propio sitio", () => {
    const external: HeroContent = { ...hero, video: { ...hero.video, src: "https://youtu.be/abc" } };
    const otherFolder: HeroContent = { ...hero, video: { ...hero.video, src: "/images/video.mp4" } };
    expect(() => parseHeroContent(external)).toThrow(/video\.src/);
    expect(() => parseHeroContent(otherFolder)).toThrow(/video\.src/);
  });

  it("rechaza textos vacíos del video, que son su nombre accesible", () => {
    const blank: HeroContent = { ...hero, video: { ...hero.video, closeLabel: " " } };
    expect(() => parseHeroContent(blank)).toThrow(/video\.closeLabel/);
  });
});
