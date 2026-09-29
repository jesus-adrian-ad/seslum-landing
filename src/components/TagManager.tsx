"use client";

/**
 * Carga Google Tag Manager con Consent Mode v2 sin bloquear el render.
 *
 * Orden de arranque: consentimiento por defecto (denegado salvo que el visitante
 * ya haya decidido), evento de inicio de GTM y, cuando la página terminó de
 * cargar y el hilo principal está libre, la descarga del contenedor. Si el ID no
 * es válido no hace nada, así el sitio funciona igual sin medición configurada.
 */

import { useEffect } from "react";
import { ensureDataLayer } from "@/lib/analytics";
import { buildConsentDefault, CONSENT_STORAGE_KEY, parseStoredPreferences } from "@/lib/consent";
import { buildGtmScriptUrl, buildGtmStartEvent, isValidGtmId } from "@/lib/gtm";

type ConsentCommand = (command: "consent", action: "default" | "update", state: object) => void;

const IDLE_TIMEOUT_MS = 3000;

const bootedContainers = new Set<string>();

const pushConsentCommand: ConsentCommand = function pushConsentCommand() {
  ensureDataLayer(window).push(arguments);
};

function readStoredPreferences(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function injectContainer(id: string): void {
  if (document.querySelector(`script[data-gtm-id="${id}"]`)) {
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = buildGtmScriptUrl(id);
  script.dataset.gtmId = id;
  document.head.append(script);
}

function runWhenIdle(task: () => void): () => void {
  let idleHandle: number | undefined;
  let timeoutHandle: number | undefined;
  const schedule = (): void => {
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
    } else {
      timeoutHandle = window.setTimeout(task, 0);
    }
  };
  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }
  return () => {
    window.removeEventListener("load", schedule);
    if (idleHandle !== undefined) {
      window.cancelIdleCallback(idleHandle);
    }
    window.clearTimeout(timeoutHandle);
  };
}

export interface TagManagerProps {
  readonly gtmId: string;
}

export function TagManager({ gtmId }: TagManagerProps): null {
  useEffect(() => {
    if (!isValidGtmId(gtmId)) {
      return undefined;
    }
    if (!bootedContainers.has(gtmId)) {
      bootedContainers.add(gtmId);
      pushConsentCommand("consent", "default", buildConsentDefault(parseStoredPreferences(readStoredPreferences())));
      ensureDataLayer(window).push(buildGtmStartEvent(Date.now()));
    }
    return runWhenIdle(() => injectContainer(gtmId));
  }, [gtmId]);

  return null;
}
