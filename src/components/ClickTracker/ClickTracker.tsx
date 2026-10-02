"use client";

/**
 * Medición de clics en enlaces con un solo listener para toda la página.
 *
 * Los enlaces se marcan con trackingAttributes() y se quedan como HTML estático,
 * sin hidratar uno por uno. Al hacer clic en uno marcado, publica su evento en
 * el dataLayer; la navegación sigue igual. Atributos fuera del catálogo se ignoran.
 */

import { useEffect } from "react";
import { TRACK_EVENT_ATTRIBUTE, TRACK_SOURCE_ATTRIBUTE, parseTrackedClick, trackEvent } from "@/lib/analytics";

const TRACKED_SELECTOR = `a[${TRACK_EVENT_ATTRIBUTE}]`;

function handleClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) {
    return;
  }
  const link = event.target.closest(TRACKED_SELECTOR);
  if (!link) {
    return;
  }
  const click = parseTrackedClick(link.getAttribute(TRACK_EVENT_ATTRIBUTE), link.getAttribute(TRACK_SOURCE_ATTRIBUTE));
  if (click) {
    trackEvent(click.event, { source: click.source });
  }
}

export function ClickTracker(): null {
  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);
  return null;
}
