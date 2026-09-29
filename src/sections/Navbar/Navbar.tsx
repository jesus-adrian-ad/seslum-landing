"use client";

/**
 * Barra de navegación fija del sitio.
 *
 * Desde 1180 px muestra los enlaces a las secciones con un indicador que sigue a
 * la sección visible. Por debajo, un botón abre el menú a pantalla completa en un
 * dialog modal (foco atrapado, cierre con Esc) que se revela con un recorte
 * hexagonal desde el propio botón. Al hacer scroll la barra se compacta y una
 * línea marca el avance de lectura. GSAP llega con carga diferida: antes de que
 * cargue, todo funciona igual pero sin animación.
 */

import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import { coveringRadius, hexagonClipPath } from "@/lib/clip-path";
import { type MotionModule, useMotionModule } from "@/lib/use-motion";
import type { NavbarContent } from "@/types/content";
import styles from "./Navbar.module.css";

const COMPACT_AFTER_PX = 48;
const DESKTOP_QUERY = "(min-width: 1180px)";
const SPY_LINE = "top 45%";
const SPY_END = "bottom 45%";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CLOSE_SPEEDUP = 1.6;

export interface NavbarProps {
  readonly content: NavbarContent;
}

interface RevealOrigin {
  readonly x: number;
  readonly y: number;
}

function originOf(element: HTMLElement | null): RevealOrigin {
  if (!element) {
    return { x: window.innerWidth, y: 0 };
  }
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

type MenuTimeline = ReturnType<MotionModule["gsap"]["timeline"]>;

export function Navbar({ content }: NavbarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const menuTimelineRef = useRef<MenuTimeline | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const motion = useMotionModule();

  const finishClose = useCallback(
    (restoreFocus: boolean): void => {
      const dialog = dialogRef.current;
      const panel = panelRef.current;
      menuTimelineRef.current?.kill();
      menuTimelineRef.current = null;
      if (panel && motion) {
        motion.gsap.set(panel, { clearProps: "clipPath" });
        motion.gsap.set(panel.querySelectorAll("[data-menu-item], [data-menu-footer]"), { clearProps: "all" });
      }
      dialog?.close();
      if (restoreFocus) {
        openButtonRef.current?.focus();
      }
    },
    [motion],
  );

  useEffect(() => {
    const header = headerRef.current;
    const progress = progressRef.current;
    if (!motion || !header || !progress) {
      return undefined;
    }
    const { gsap, ScrollTrigger } = motion;
    const context = gsap.context(() => {
      ScrollTrigger.create({
        start: COMPACT_AFTER_PX,
        end: "max",
        onToggle: (self) => {
          header.dataset.compact = String(self.isActive);
        },
      });

      gsap.fromTo(
        progress,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } },
      );

      gsap.matchMedia().add(DESKTOP_QUERY, () => {
        if (dialogRef.current?.open) {
          finishClose(false);
        }
      });

      for (const link of content.links) {
        const section = document.getElementById(link.id);
        if (!section) {
          continue;
        }
        ScrollTrigger.create({
          trigger: section,
          start: SPY_LINE,
          end: SPY_END,
          onToggle: (self) => {
            setActiveId((current) => (self.isActive ? link.id : current === link.id ? null : current));
          },
        });
      }
    }, header);
    return () => context.revert();
  }, [motion, content.links, finishClose]);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const list = linksRef.current;
    if (!motion || !indicator || !list) {
      return;
    }
    const { gsap, MOTION } = motion;
    const target = activeId ? list.querySelector<HTMLAnchorElement>(`a[data-section="${activeId}"]`) : null;
    const duration = prefersReducedMotion() ? 0 : MOTION.durationBase;
    if (!target) {
      gsap.to(indicator, { autoAlpha: 0, duration });
      return;
    }
    gsap.to(indicator, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      autoAlpha: 1,
      duration,
      ease: MOTION.easeOut,
    });
  }, [motion, activeId]);

  const buildMenuTimeline = useCallback((loaded: MotionModule, origin: RevealOrigin): MenuTimeline | null => {
    const panel = panelRef.current;
    if (!panel) {
      return null;
    }
    const { gsap, MOTION } = loaded;
    const reveal = { radius: 0 };
    const finalRadius = coveringRadius(origin.x, origin.y, window.innerWidth, window.innerHeight);
    const applyClip = (): void => {
      panel.style.clipPath = hexagonClipPath(origin.x, origin.y, reveal.radius);
    };
    const items = panel.querySelectorAll("[data-menu-item]");
    const footer = panel.querySelectorAll("[data-menu-footer]");

    return gsap
      .timeline({ paused: true, defaults: { ease: MOTION.easeOut } })
      .fromTo(
        reveal,
        { radius: 0 },
        { radius: finalRadius, duration: MOTION.durationSlow, ease: MOTION.easeInOut, onUpdate: applyClip, onStart: applyClip },
      )
      .fromTo(
        items,
        { yPercent: 110 },
        { yPercent: 0, duration: MOTION.durationBase, stagger: MOTION.stagger },
        "-=0.35",
      )
      .fromTo(footer, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: MOTION.durationBase }, "-=0.25")
      .eventCallback("onComplete", () => {
        panel.style.clipPath = "";
      });
  }, []);

  const openMenu = useCallback((): void => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }
    dialog.showModal();
    if (!motion || prefersReducedMotion()) {
      return;
    }
    const timeline = buildMenuTimeline(motion, originOf(openButtonRef.current));
    menuTimelineRef.current = timeline;
    timeline?.play(0);
  }, [motion, buildMenuTimeline]);

  const closeMenu = useCallback((): void => {
    const timeline = menuTimelineRef.current;
    if (!timeline || prefersReducedMotion()) {
      finishClose(true);
      return;
    }
    timeline.eventCallback("onReverseComplete", () => finishClose(true));
    timeline.timeScale(CLOSE_SPEEDUP).reverse();
  }, [finishClose]);

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>): void => {
      event.preventDefault();
      closeMenu();
    },
    [closeMenu],
  );

  const handleMenuLinkClick = useCallback((): void => {
    finishClose(false);
  }, [finishClose]);

  return (
    <header ref={headerRef} className={styles.header} data-compact="false">
      <div className={`container ${styles.bar}`}>
        <a className={styles.brand} href={content.homeHref}>
          <img
            className={styles.logo}
            src={content.logo.src}
            srcSet={content.logo.srcSet}
            sizes={content.logo.sizes}
            alt={content.logo.alt}
            width={content.logo.width}
            height={content.logo.height}
            decoding="async"
          />
        </a>

        <nav className={styles.nav} aria-label={content.ariaLabel}>
          <ul ref={linksRef} className={styles.links}>
            {content.links.map((link) => (
              <li key={link.id}>
                <a
                  className={styles.link}
                  href={link.href}
                  data-section={link.id}
                  aria-current={activeId === link.id ? "location" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
        </nav>

        <div className={styles.actions}>
          <ButtonLink href={content.cta.href} shortLabel={content.cta.shortLabel}>
            {content.cta.label}
          </ButtonLink>
          <button
            ref={openButtonRef}
            type="button"
            className={styles.menuButton}
            aria-haspopup="dialog"
            aria-controls="site-menu"
            aria-label={content.menu.openLabel}
            onClick={openMenu}
          >
            <span className={styles.burger} aria-hidden="true" />
          </button>
        </div>
      </div>

      <span ref={progressRef} className={styles.progress} aria-hidden="true" />

      <dialog
        ref={dialogRef}
        id="site-menu"
        className={styles.menu}
        aria-label={content.menu.title}
        onCancel={handleCancel}
      >
        <div ref={panelRef} className={styles.panel}>
          <div className={`container ${styles.menuBar}`}>
            <img
              className={styles.logo}
              src={content.logo.src}
              srcSet={content.logo.srcSet}
              sizes={content.logo.sizes}
              alt=""
              width={content.logo.width}
              height={content.logo.height}
              decoding="async"
            />
            <button type="button" className={styles.closeButton} aria-label={content.menu.closeLabel} onClick={closeMenu}>
              <span className={styles.close} aria-hidden="true" />
            </button>
          </div>

          <nav className={`container ${styles.menuNav}`} aria-label={content.ariaLabel}>
            <ol className={styles.menuList}>
              {content.links.map((link, index) => (
                <li key={link.id} className={styles.menuRow}>
                  <a className={styles.menuLink} href={link.href} onClick={handleMenuLinkClick} data-menu-item>
                    <span className={styles.menuIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={`container ${styles.menuFooter}`} data-menu-footer>
            <ButtonLink href={content.cta.href} block onClick={handleMenuLinkClick}>
              {content.cta.label}
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </header>
  );
}
