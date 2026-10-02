/**
 * Preguntas frecuentes: acordeón de una sola pregunta abierta a la vez, con la
 * primera desplegada al cargar.
 *
 * Usa details y summary nativos agrupados por name: abren con teclado y sin
 * JavaScript, el navegador cierra la anterior al abrir otra y la búsqueda en la
 * página despliega la respuesta que encuentra. Las respuestas están en el HTML
 * desde el inicio y se publican también como FAQPage con el mismo texto (el
 * JSON-LD se inserta después del build, ver structured-data.json/route.ts).
 */

import { LineIcon, type LineShape } from "@/components/LineIcon/LineIcon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import type { FaqContent } from "@/types/content";
import styles from "./Faq.module.css";

const CHEVRON: readonly LineShape[] = [{ kind: "path", d: "M9 13l7 7 7-7" }];
const CHEVRON_STROKE_WIDTH = 2.5;

export interface FaqProps {
  readonly content: FaqContent;
}

export function Faq({ content }: FaqProps) {
  const titleId = `${content.id}-title`;
  const groupName = `${content.id}-accordion`;

  return (
    <section id={content.id} className={styles.faq} aria-labelledby={titleId}>
      <div className={`container ${styles.inner}`}>
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <div className={styles.list}>
          {content.items.map((item, index) => (
            <details
              key={item.id}
              name={groupName}
              open={index === 0}
              className={`chamfer-frame ${styles.item}`}
              data-reveal=""
            >
              <summary className={styles.question}>
                <span>{item.question}</span>
                <LineIcon shapes={CHEVRON} className={styles.chevron} strokeWidth={CHEVRON_STROKE_WIDTH} />
              </summary>
              <div className={styles.answer}>
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
