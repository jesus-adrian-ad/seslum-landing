import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { hero } from "@/lib/content";
import { HeroVideo } from "./HeroVideo";

const { video } = hero;
const markup = renderToStaticMarkup(<HeroVideo content={video} />);

describe("HeroVideo", () => {
  it("abre con un botón cuyo nombre es el título y la duración", () => {
    expect(markup).toContain('<button type="button"');
    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain(`>${video.label}</span>`);
    expect(markup).toContain(`>${video.meta}</span>`);
  });

  it("muestra la miniatura como imagen decorativa y sin precargarla", () => {
    expect(markup).toContain(`src="${video.thumbnail.src}"`);
    expect(markup).toMatch(/<img[^>]*alt=""/);
    expect(markup).toMatch(/<img[^>]*loading="lazy"/);
    expect(markup).not.toContain('rel="preload"');
  });

  it("no descarga el video ni el póster hasta que se abre la ventana", () => {
    expect(markup).toContain('preload="none"');
    expect(markup).not.toContain(video.poster.src);
    expect(markup).toContain(`src="${video.src}"`);
  });

  it("reproduce en línea con controles dentro de una ventana etiquetada", () => {
    expect(markup).toMatch(new RegExp(`<dialog [^>]*aria-label="${video.title}"`));
    expect(markup).toMatch(/<video[^>]*controls=""/);
    expect(markup).toMatch(/<video[^>]*playsInline=""|<video[^>]*playsinline=""/);
    expect(markup).toContain(`aria-label="${video.closeLabel}"`);
  });
});
