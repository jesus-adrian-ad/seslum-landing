import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { hero } from "@/lib/content";
import { DEFERRED_SRC_ATTR, DEFERRED_SRCSET_ATTR } from "@/lib/deferred-media";
import { Hero } from "./Hero";

const markup = renderToStaticMarkup(<Hero content={hero} />);
const count = (pattern: RegExp) => markup.match(pattern)?.length ?? 0;

describe("Hero", () => {
  it("solo la primera foto sale con src; las demás, con los atributos que carga HeroSlideLoader", () => {
    const [first, ...rest] = hero.media.slides;
    expect(count(/<img [^>]*\ssrc="/g)).toBe(1);
    expect(markup).toContain(`src="${first?.landscape.src}"`);
    expect(count(new RegExp(`<img [^>]*${DEFERRED_SRC_ATTR}="`, "g"))).toBe(rest.length);
    expect(count(new RegExp(`${DEFERRED_SRCSET_ATTR}="`, "g"))).toBe(rest.length * 3);
  });

  it("da a cada pantalla una sola foto: teléfono, tableta vertical u horizontal", () => {
    const [first] = hero.media.slides;
    expect(markup).toContain(`<source media="(orientation: portrait) and (max-width: 480px)" srcSet="${first?.portrait.phone.src}"`);
    expect(markup).toContain(`<source media="(orientation: portrait) and (min-width: 481px)" srcSet="${first?.portrait.tablet.src}"`);
    expect(count(/<link rel="preload"/g)).toBe(3);
    expect(count(/<source media="\(orientation: portrait\) and \(max-width: 480px\)"/g)).toBe(hero.media.slides.length);
  });

  it("describe la secuencia en la primera foto y deja las demás como decorativas", () => {
    expect(count(new RegExp(`alt="${hero.media.alt}"`, "g"))).toBe(1);
    expect(count(/alt=""/g)).toBe(hero.media.slides.length - 1);
  });
});
