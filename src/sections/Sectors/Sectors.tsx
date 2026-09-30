/**
 * Sectores: a quién sirve Grupo SESLUM, con un panel de detalle por industria.
 *
 * El encabezado se renderiza en el servidor; las pestañas son un componente de
 * cliente porque manejan estado y teclado. ScrollReveal añade la entrada al
 * hacer scroll y el dibujo de los íconos de las pestañas.
 */

import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import type { SectorsContent } from "@/types/content";
import { SectorTabs } from "./SectorTabs";
import styles from "./Sectors.module.css";

export interface SectorsProps {
  readonly content: SectorsContent;
}

export function Sectors({ content }: SectorsProps) {
  const titleId = `${content.id}-title`;

  return (
    <section id={content.id} className={styles.sectors} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />
        <SectorTabs idPrefix={content.id} label={content.tabsLabel} sectors={content.sectors} />
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
