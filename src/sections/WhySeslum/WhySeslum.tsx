/**
 * Por qué SESLUM: tabla comparativa entre trabajar con un integrador y con
 * proveedores separados.
 *
 * Es una tabla real con encabezados de fila y de columna. En móvil cada fila se
 * muestra como tarjeta biselada y el marco general desaparece; en escritorio es
 * al revés. Ambos usan .chamfer-frame y se apagan con sus propiedades
 * (--frame-color, --frame-cut). Los roles ARIA van explícitos: al cambiar el
 * display de la tabla, algunos navegadores descartan su semántica nativa. Cada
 * celda repite la etiqueta de su columna, visible solo en móvil, porque ahí el
 * encabezado de columnas se oculta.
 */

import { ComparisonIcon } from "@/components/ComparisonIcon/ComparisonIcon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import type { WhySeslumContent } from "@/types/content";
import styles from "./WhySeslum.module.css";

export interface WhySeslumProps {
  readonly content: WhySeslumContent;
}

export function WhySeslum({ content }: WhySeslumProps) {
  const titleId = `${content.id}-title`;
  const { table } = content;

  return (
    <section id={content.id} className={styles.whySeslum} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <div className={`chamfer-frame ${styles.frame}`} data-reveal="">
          <table className={styles.table} role="table">
            <caption className="visually-hidden">{table.caption}</caption>
            <colgroup>
              <col className={styles.criterionColumn} />
              <col />
              <col />
            </colgroup>
            <thead className={styles.head} role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  <span className="visually-hidden">{table.criterionLabel}</span>
                </th>
                <th scope="col" role="columnheader" className={styles.integratorHead}>
                  {table.integratorLabel}
                </th>
                <th scope="col" role="columnheader" className={styles.separateHead}>
                  {table.separateLabel}
                </th>
              </tr>
            </thead>
            <tbody className={styles.body} role="rowgroup">
              {table.rows.map((row) => (
                <tr key={row.criterion} className={`chamfer-frame ${styles.row}`} role="row">
                  <th scope="row" role="rowheader" className={styles.criterion}>
                    {row.criterion}
                  </th>
                  <td role="cell" className={`${styles.cell} ${styles.integrator}`}>
                    <ComparisonIcon name="check" className={styles.checkIcon} />
                    <span>
                      <span className={styles.cellLabel}>{table.integratorLabel}</span>
                      {row.integrator}
                    </span>
                  </td>
                  <td role="cell" className={`${styles.cell} ${styles.separate}`}>
                    <ComparisonIcon name="cross" className={styles.crossIcon} />
                    <span>
                      <span className={styles.cellLabel}>{table.separateLabel}</span>
                      {row.separate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
