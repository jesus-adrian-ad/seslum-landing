/**
 * Enlace con apariencia de botón, con la esquina biselada de la marca.
 *
 * Componente sin estado: recibe destino, texto y variante. El texto corto, si se
 * da, sustituye al largo en pantallas estrechas. Solo uno de los dos se muestra a
 * la vez, así el nombre accesible siempre coincide con lo que se ve.
 */

import type { MouseEventHandler, ReactNode } from "react";
import styles from "./ButtonLink.module.css";

export type ButtonVariant = "primary" | "outline";

export interface ButtonLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly shortLabel?: string;
  readonly variant?: ButtonVariant;
  readonly block?: boolean;
  readonly className?: string;
  readonly onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function ButtonLink({
  href,
  children,
  shortLabel,
  variant = "primary",
  block = false,
  className,
  onClick,
}: ButtonLinkProps) {
  const classes = [styles.button, styles[variant], block ? styles.block : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} href={href} onClick={onClick}>
      {shortLabel ? (
        <>
          <span className={styles.long}>{children}</span>
          <span className={styles.short}>{shortLabel}</span>
        </>
      ) : (
        children
      )}
    </a>
  );
}
