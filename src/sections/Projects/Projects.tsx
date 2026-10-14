/**
 * Proyectos: la obra ejecutada agrupada por sector. El primer sector va como
 * destacado a todo el ancho y los demás en rejilla; cada tarjeta muestra el
 * ícono y el nombre del sector y los sistemas instalados como etiquetas.
 *
 * Se renderiza en el servidor y no carga JavaScript propio: la entrada al hacer
 * scroll es CSS con animation-timeline (Projects.module.css). Con ScrollReveal,
 * esta sección sumaba un ciclo más de lectura y escritura de layout tras la
 * hidratación y el reflow forzado pasaba los 30 ms que tolera Lighthouse.
 */

import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import { SectorIcon } from "@/components/SectorIcon/SectorIcon";
import type { ProjectCard, ProjectsContent } from "@/types/content";
import styles from "./Projects.module.css";

interface ProjectTileProps {
  readonly card: ProjectCard;
  readonly systemsLabel: string;
  readonly featuredLabel?: string;
}

function ProjectTile({ card, systemsLabel, featuredLabel }: ProjectTileProps) {
  const featured = featuredLabel !== undefined;
  return (
    <li className={`chamfer-frame ${styles.card} ${featured ? styles.featured : ""}`} data-reveal="">
      <SectorIcon name={card.icon} className={styles.icon} />
      <div className={styles.body}>
        {featured ? <p className={styles.badge}>{featuredLabel}</p> : null}
        <h3 className={styles.name}>{card.name}</h3>
        <ul className={styles.systems} aria-label={systemsLabel}>
          {card.systems.map((system) => (
            <li key={system} className={styles.system}>
              {system}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export interface ProjectsProps {
  readonly content: ProjectsContent;
}

export function Projects({ content }: ProjectsProps) {
  const titleId = `${content.id}-title`;

  return (
    <section id={content.id} className={styles.projects} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />
        <ul className={styles.grid}>
          <ProjectTile card={content.featured} systemsLabel={content.systemsLabel} featuredLabel={content.featuredLabel} />
          {content.others.map((card) => (
            <ProjectTile key={card.id} card={card} systemsLabel={content.systemsLabel} />
          ))}
        </ul>
      </div>
    </section>
  );
}
