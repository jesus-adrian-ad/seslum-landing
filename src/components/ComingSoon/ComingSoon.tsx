/**
 * Página de sitio en construcción: logo, título y una línea.
 *
 * La muestra el dominio mientras NEXT_PUBLIC_SITE_MODE vale "coming-soon" (ver
 * env.ts). Es un componente de servidor sin JavaScript propio, y el layout no
 * carga medición ni banner de cookies en ese modo.
 */

import type { ComingSoonContent } from "@/types/content";
import styles from "./ComingSoon.module.css";

export interface ComingSoonProps {
  readonly content: ComingSoonContent;
}

export function ComingSoon({ content }: ComingSoonProps) {
  const { logo, title, lead } = content;
  return (
    <main id="main" className={`container ${styles.page}`}>
      <img className={styles.logo} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
    </main>
  );
}
