/**
 * Encabezado estándar de sección: eyebrow, título h2 y texto de entrada.
 *
 * Todas las secciones abren igual; tener un solo componente mantiene la escala
 * tipográfica y el orden de entrada idénticos en toda la página. Cada línea
 * lleva data-reveal para que ScrollReveal la haga entrar en cascada.
 */

import styles from "./SectionHeading.module.css";

export interface SectionHeadingProps {
  readonly titleId: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead?: string;
}

export function SectionHeading({ titleId, eyebrow, title, lead }: SectionHeadingProps) {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow} data-reveal="">
        {eyebrow}
      </p>
      <h2 id={titleId} className={styles.title} data-reveal="">
        {title}
      </h2>
      {lead ? (
        <p className={styles.lead} data-reveal="">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
