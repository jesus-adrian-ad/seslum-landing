"use client";

/**
 * Pestañas de sectores con el patrón WAI-ARIA Tabs.
 *
 * Una sola parada de Tab en la lista (tabindex itinerante), flechas en ambos
 * ejes, Inicio y Fin, y activación automática al moverse. Todos los paneles
 * viven en el HTML estático para que los buscadores lean los siete; solo el
 * activo se muestra. En móvil la lista es una tira horizontal deslizable que
 * centra la pestaña elegida; desde 900 px es una columna junto al panel.
 *
 * El indicador se posiciona con propiedades CSS escritas desde JavaScript y se
 * mueve con transiciones CSS, así no depende de GSAP ni viola la CSP.
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SectorIcon } from "@/components/SectorIcon/SectorIcon";
import { nextTabIndex } from "@/lib/tabs";
import { useMediaQuery } from "@/lib/use-media-query";
import type { SectorItem } from "@/types/content";
import styles from "./Sectors.module.css";

const VERTICAL_QUERY = "(min-width: 900px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface SectorTabsProps {
  readonly idPrefix: string;
  readonly label: string;
  readonly sectors: readonly SectorItem[];
}

export function SectorTabs({ idPrefix, label, sectors }: SectorTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isVertical = useMediaQuery(VERTICAL_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedByUser = useRef(false);

  const placeIndicator = useCallback(() => {
    const tab = tabRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!tab || !indicator) {
      return;
    }
    indicator.style.setProperty("--indicator-x", `${tab.offsetLeft}px`);
    indicator.style.setProperty("--indicator-y", `${tab.offsetTop}px`);
    indicator.style.setProperty("--indicator-width", `${tab.offsetWidth}px`);
    indicator.style.setProperty("--indicator-height", `${tab.offsetHeight}px`);
    indicator.dataset.ready = "true";
  }, [activeIndex]);

  useEffect(() => {
    placeIndicator();
    const list = listRef.current;
    if (!list) {
      return undefined;
    }
    const observer = new ResizeObserver(placeIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [placeIndicator, isVertical]);

  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!selectedByUser.current || isVertical || !list || !tab) {
      return;
    }
    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeIndex, isVertical, reducedMotion]);

  const select = (index: number, moveFocus: boolean): void => {
    selectedByUser.current = true;
    setActiveIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const next = nextTabIndex(event.key, index, sectors.length);
    if (next === null) {
      return;
    }
    event.preventDefault();
    select(next, true);
  };

  return (
    <div className={styles.layout}>
      <div className={styles.listWrap} data-reveal="">
        <div
          ref={listRef}
          className={styles.list}
          role="tablist"
          aria-label={label}
          aria-orientation={isVertical ? "vertical" : "horizontal"}
        >
          {sectors.map((sector, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={sector.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${idPrefix}-tab-${sector.id}`}
                className={styles.tab}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${idPrefix}-panel-${sector.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index, false)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <SectorIcon name={sector.icon} className={styles.tabIcon} draw />
                <span className={styles.tabText}>
                  <span className={styles.tabName}>{sector.name}</span>
                  <span className={styles.tabSummary}>{sector.summary}</span>
                </span>
              </button>
            );
          })}
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
        </div>
      </div>

      <div className={`chamfer-frame ${styles.panelFrame}`} data-reveal="">
        {sectors.map((sector, index) => (
          <div
            key={sector.id}
            id={`${idPrefix}-panel-${sector.id}`}
            className={styles.panel}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${sector.id}`}
            tabIndex={0}
            hidden={index !== activeIndex}
          >
            <div className={styles.panelHead}>
              <SectorIcon name={sector.icon} className={styles.panelIcon} />
              <div>
                <h3 className={styles.panelName}>{sector.name}</h3>
                <p className={styles.panelSummary}>{sector.summary}</p>
              </div>
            </div>
            <p className={styles.panelDescription}>{sector.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
