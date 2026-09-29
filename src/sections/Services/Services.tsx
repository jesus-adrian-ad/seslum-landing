/**
 * Servicios: las especialidades agrupadas en tarjetas y, debajo, los servicios
 * que aplican a todas las líneas.
 *
 * Se renderiza en el servidor y se ve completa sin JavaScript. ScrollReveal
 * añade la entrada en cascada y el dibujo de los íconos cuando GSAP ya cargó.
 */

import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import { ServiceIcon } from "@/components/ServiceIcon/ServiceIcon";
import type { ServiceItem, ServicesContent } from "@/types/content";
import styles from "./Services.module.css";

export interface ServicesProps {
  readonly content: ServicesContent;
}

interface ServiceListProps {
  readonly items: readonly ServiceItem[];
  readonly className: string | undefined;
}

function ServiceList({ items, className }: ServiceListProps) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.name} className={styles.item}>
          <ServiceIcon name={item.icon} className={styles.icon} />
          <div>
            <h4 className={styles.name}>{item.name}</h4>
            <p className={styles.description}>{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Services({ content }: ServicesProps) {
  const titleId = `${content.id}-title`;
  const transversalTitleId = `${content.id}-transversal`;

  return (
    <section id={content.id} className={styles.services} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />

        <div className={styles.groups}>
          {content.groups.map((group) => {
            const groupTitleId = `${content.id}-${group.id}`;
            return (
              <div
                key={group.id}
                className={`chamfer-frame ${styles.card}`}
                role="group"
                aria-labelledby={groupTitleId}
                data-reveal=""
              >
                <h3 id={groupTitleId} className={styles.groupTitle}>
                  {group.title}
                </h3>
                <p className={styles.groupSummary}>{group.summary}</p>
                <ServiceList items={group.items} className={styles.list} />
              </div>
            );
          })}
        </div>

        <div
          className={`chamfer-frame ${styles.card} ${styles.strip}`}
          role="group"
          aria-labelledby={transversalTitleId}
          data-reveal=""
        >
          <h3 id={transversalTitleId} className="visually-hidden">
            {content.transversal.title}
          </h3>
          <ServiceList items={content.transversal.items} className={styles.stripList} />
        </div>
      </div>

      <ScrollReveal rootId={content.id} />
    </section>
  );
}
