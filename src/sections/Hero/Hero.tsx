/**
 * Encabezado: carrusel de fotos de obra a pantalla completa con el tratamiento
 * de color de la marca, título, descripción (una frase por línea), llamadas a
 * la acción y el panel de líneas integradas, cuyo pie enlaza a Servicios.
 *
 * Se renderiza en el servidor. La entrada y el carrusel son CSS puro, así se
 * ven animados desde el primer pintado sin esperar a JavaScript; solo el
 * parallax del scroll vive en HeroScrollEffects. Debajo de las llamadas a la
 * acción va el mensaje del director (HeroVideo), que abre el video en una ventana.
 *
 * Cada foto trae un recorte horizontal (srcset por ancho) y dos verticales: uno
 * de 430 px para teléfonos y uno mayor para tabletas. Los verticales van a
 * densidad 1x a propósito: la foto queda detrás del tinte y el velo oscuros, la
 * diferencia no se ve y la foto LCP en móvil pesa una fracción. Las tres
 * condiciones de media son excluyentes para que cada pantalla precargue una
 * sola foto. Solo la primera se precarga, con prioridad alta, porque es el LCP;
 * las demás salen con sus URLs en los atributos de lib/deferred-media y las
 * carga HeroSlideLoader al terminar la carga de la página. Llevan alt vacío
 * porque la primera describe la secuencia.
 */

import { Fragment } from "react";
import { preload } from "react-dom";
import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import type { HeroContent, HeroSlide } from "@/types/content";
import styles from "./Hero.module.css";
import { HeroScrollEffects } from "./HeroScrollEffects";
import { HeroSlideLoader } from "./HeroSlideLoader";
import { HeroVideo } from "./HeroVideo";

const PHONE_MEDIA = "(orientation: portrait) and (max-width: 480px)";
const TABLET_MEDIA = "(orientation: portrait) and (min-width: 481px)";
const LANDSCAPE_MEDIA = "(orientation: landscape)";

function preloadFirstSlide(slide: HeroSlide, sizes: string): void {
  const { landscape, portrait } = slide;
  preload(landscape.src, { as: "image", fetchPriority: "high", imageSrcSet: landscape.srcSet, imageSizes: sizes, media: LANDSCAPE_MEDIA });
  preload(portrait.phone.src, { as: "image", fetchPriority: "high", media: PHONE_MEDIA });
  preload(portrait.tablet.src, { as: "image", fetchPriority: "high", media: TABLET_MEDIA });
}

interface HeroSlidePictureProps {
  readonly slide: HeroSlide;
  readonly sizes: string;
  readonly alt: string;
  readonly deferred: boolean;
}

function HeroSlidePicture({ slide, sizes, alt, deferred }: HeroSlidePictureProps) {
  const { landscape, portrait } = slide;
  const now = (value: string) => (deferred ? undefined : value);
  const later = (value: string) => (deferred ? value : undefined);
  return (
    <picture className={styles.slide}>
      <source
        media={PHONE_MEDIA}
        srcSet={now(portrait.phone.src)}
        data-deferred-srcset={later(portrait.phone.src)}
        width={portrait.phone.width}
        height={portrait.phone.height}
      />
      <source
        media={TABLET_MEDIA}
        srcSet={now(portrait.tablet.src)}
        data-deferred-srcset={later(portrait.tablet.src)}
        width={portrait.tablet.width}
        height={portrait.tablet.height}
      />
      <img
        className={styles.image}
        src={now(landscape.src)}
        srcSet={now(landscape.srcSet)}
        data-deferred-src={later(landscape.src)}
        data-deferred-srcset={later(landscape.srcSet)}
        sizes={sizes}
        alt={alt}
        width={landscape.width}
        height={landscape.height}
        fetchPriority={deferred ? "low" : "high"}
        decoding="async"
      />
    </picture>
  );
}

export interface HeroProps {
  readonly content: HeroContent;
}

export function Hero({ content }: HeroProps) {
  const { media, panel } = content;
  const [first] = media.slides;
  const words = content.title.split(" ");

  if (first) {
    preloadFirstSlide(first, media.sizes);
  }

  return (
    <section id={content.id} className={styles.hero} aria-labelledby={`${content.id}-title`}>
      <div className={styles.media} data-hero-media>
        <div className={styles.slides}>
          {media.slides.map((slide, index) => (
            <HeroSlidePicture
              key={slide.id}
              slide={slide}
              sizes={media.sizes}
              alt={index === 0 ? media.alt : ""}
              deferred={index > 0}
            />
          ))}
        </div>
        <span className={styles.tint} aria-hidden="true" />
        <span className={styles.veil} aria-hidden="true" />
      </div>

      <div className={`container ${styles.grid}`} data-hero-content>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1 id={`${content.id}-title`} className={styles.title}>
            {words.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                {index > 0 ? " " : null}
                <span className={styles.word}>
                  <span className={styles.wordInner}>{word}</span>
                </span>
              </Fragment>
            ))}
          </h1>
          <p className={styles.lead}>
            {content.lead.map((line) => (
              <span key={line} className={styles.leadLine}>
                {line}
              </span>
            ))}
          </p>
          <div className={styles.actions}>
            <ButtonLink href={content.primaryCta.href}>{content.primaryCta.label}</ButtonLink>
            <ButtonLink href={content.secondaryCta.href} variant="outline">
              {content.secondaryCta.label}
            </ButtonLink>
          </div>
          <div className={styles.video}>
            <HeroVideo content={content.video} />
          </div>
        </div>

        <aside className={`chamfer-lg ${styles.panel}`} aria-labelledby={`${content.id}-panel-title`}>
          <span className={styles.scan} aria-hidden="true" />
          <h2 id={`${content.id}-panel-title`} className={styles.panelTitle}>
            {panel.title}
          </h2>
          <ul className={styles.lines}>
            {panel.lines.map((line) => (
              <li key={line} className={styles.line}>
                {line}
                <span className={styles.status} aria-hidden="true" />
              </li>
            ))}
          </ul>
          <a className={styles.more} href={panel.more.href}>
            {panel.more.label}
          </a>
        </aside>
      </div>

      <HeroScrollEffects sectionId={content.id} />
      <HeroSlideLoader sectionId={content.id} />
    </section>
  );
}
