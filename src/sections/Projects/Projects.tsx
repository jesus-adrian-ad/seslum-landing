/**
 * Proyectos: fotos de obra agrupadas por línea de servicio, en pestañas, con una
 * foto grande y cuatro chicas por línea (ver ProjectGallery).
 *
 * La entrada al hacer scroll es CSS con animation-timeline (Projects.module.css)
 * y no pasa por ScrollReveal: con él, esta sección sumaba un ciclo más de
 * lectura y escritura de layout tras la hidratación y el reflow forzado pasaba
 * los 30 ms que tolera Lighthouse.
 */

import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import type { ProjectsContent } from "@/types/content";
import { ProjectGallery } from "./ProjectGallery";
import styles from "./Projects.module.css";

export interface ProjectsProps {
  readonly content: ProjectsContent;
}

export function Projects({ content }: ProjectsProps) {
  const titleId = `${content.id}-title`;

  return (
    <section id={content.id} className={styles.projects} aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />
        <ProjectGallery
          idPrefix={content.id}
          tabsLabel={content.tabsLabel}
          enlargeHint={content.enlargeHint}
          lightbox={content.lightbox}
          services={content.services}
        />
      </div>
    </section>
  );
}
