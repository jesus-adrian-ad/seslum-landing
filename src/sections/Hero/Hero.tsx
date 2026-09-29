/**
 * Encabezado: foto de obra a pantalla completa con el tratamiento de color de la
 * marca, título, llamadas a la acción y el panel de líneas integradas.
 *
 * Se renderiza en el servidor. La entrada es CSS puro, así se ve animada desde
 * el primer pintado sin esperar a JavaScript; solo el parallax del scroll vive
 * en HeroScrollEffects. La foto se precarga con prioridad alta porque es el LCP.
 */

import { Fragment } from "react";
import { preload } from "react-dom";
import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import type { HeroContent } from "@/types/content";
import styles from "./Hero.module.css";
import { HeroScrollEffects } from "./HeroScrollEffects";

export interface HeroProps {
  readonly content: HeroContent;
}

export function Hero({ content }: HeroProps) {
  const { image, panel } = content;
  const words = content.title.split(" ");

  preload(image.src, {
    as: "image",
    fetchPriority: "high",
    ...(image.srcSet ? { imageSrcSet: image.srcSet } : {}),
    ...(image.sizes ? { imageSizes: image.sizes } : {}),
  });

  return (
    <section id={content.id} className={styles.hero} aria-labelledby={`${content.id}-title`}>
      <div className={styles.media} data-hero-media>
        <img
          className={styles.image}
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          decoding="async"
        />
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
          <p className={styles.lead}>{content.lead}</p>
          <div className={styles.actions}>
            <ButtonLink href={content.primaryCta.href}>{content.primaryCta.label}</ButtonLink>
            <ButtonLink href={content.secondaryCta.href} variant="outline">
              {content.secondaryCta.label}
            </ButtonLink>
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
          <p className={styles.more}>{panel.more}</p>
        </aside>
      </div>

      <HeroScrollEffects sectionId={content.id} />
    </section>
  );
}
