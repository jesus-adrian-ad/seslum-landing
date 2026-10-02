"use client";

/**
 * Enlace que publica un evento de medición al hacer clic, sin alterar la
 * navegación: el evento se envía al dataLayer y el navegador sigue el enlace
 * como siempre. Los enlaces externos abren en otra pestaña con
 * noopener/noreferrer.
 */

import type { ReactNode } from "react";
import { type AnalyticsEventName, type EventSource, trackEvent } from "@/lib/analytics";

export interface TrackedLinkProps {
  readonly href: string;
  readonly event: AnalyticsEventName;
  readonly source: EventSource;
  readonly children: ReactNode;
  readonly className?: string | undefined;
  readonly external?: boolean;
}

export function TrackedLink({ href, event, source, children, className, external = false }: TrackedLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(event, { source })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
