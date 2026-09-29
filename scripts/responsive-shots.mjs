#!/usr/bin/env node
/**
 * responsive-shots.mjs — QA responsive en los 7 anchos del método.
 *
 * Captura 320, 375, 425, 768, 1024, 1440 y 2560 px, y verifica lo que se puede
 * verificar objetivamente: scroll horizontal, elementos que desbordan, tap
 * targets pequeños, texto diminuto e imágenes sin dimensiones (causa número
 * uno de CLS).
 *
 * Lo que el script NO puede juzgar es si se ve bien. Eso lo miras tú en los
 * PNG antes de dar el bloque por cerrado.
 *
 * Corre con movimiento reducido: audita el layout final, no un fotograma a
 * mitad de una animación de entrada (un translateX en curso parece desborde).
 *
 *   node scripts/responsive-shots.mjs --url http://localhost:4321
 *   node scripts/responsive-shots.mjs --url http://localhost:4321 --section hero
 *   node scripts/responsive-shots.mjs --url http://localhost:4321 --ci
 *
 * Requiere Playwright:  npm i -D playwright && npx playwright install chromium
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const WIDTHS = [320, 375, 425, 768, 1024, 1440, 2560];
const MIN_TAP_TARGET = 44;
const MIN_FONT_SIZE = 14;

const args = process.argv.slice(2);
const getArg = (flag, fallback = null) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const url = getArg("--url");
const section = getArg("--section", "full-page");
const ci = args.includes("--ci");
const outDir = getArg("--out", path.join(".previews", "qa", section));

if (!url) {
  console.error("Falta --url. Ejemplo:");
  console.error("  node scripts/responsive-shots.mjs --url http://localhost:4321");
  process.exit(2);
}

/** Auditoría que corre dentro de la página, en cada ancho. */
const audit = ({ minTap, minFont }) => {
  const issues = [];
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className
      ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
      : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 1) {
    issues.push({
      type: "horizontal-scroll",
      severity: "error",
      detail: `La página se desplaza horizontalmente: ${doc.scrollWidth}px de contenido en ${doc.clientWidth}px de viewport.`,
    });
  }

  const vw = doc.clientWidth;
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    // Desbordes: se ignora lo que desborda a propósito dentro de su propio
    // contenedor con overflow (tablas, bloques de código).
    if (r.right > vw + 1 || r.left < -1) {
      const parent = el.parentElement;
      const parentOverflow = parent ? getComputedStyle(parent).overflowX : "visible";
      if (parentOverflow !== "auto" && parentOverflow !== "scroll" && parentOverflow !== "hidden") {
        issues.push({
          type: "overflow",
          severity: "error",
          detail: `${describe(el)} desborda el viewport (izq ${Math.round(r.left)}, der ${Math.round(r.right)}, viewport ${vw}).`,
        });
      }
    }

    // Texto demasiado pequeño
    const fs = parseFloat(style.fontSize);
    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
    );
    if (hasOwnText && fs && fs < minFont) {
      issues.push({
        type: "small-text",
        severity: "warning",
        detail: `${describe(el)} usa ${fs}px (mínimo ${minFont}px).`,
      });
    }
  }

  // Tap targets: solo lo interactivo y visible
  const interactive = document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  for (const el of interactive) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Un enlace dentro de un párrafo es texto, no un tap target independiente.
    const inProse = el.tagName === "A" && el.closest("p, li");
    if (inProse) continue;
    if (r.width < minTap || r.height < minTap) {
      issues.push({
        type: "small-tap-target",
        severity: "error",
        detail: `${describe(el)} mide ${Math.round(r.width)}×${Math.round(r.height)}px (mínimo ${minTap}×${minTap}).`,
      });
    }
  }

  // Imágenes sin dimensiones → CLS
  for (const img of document.querySelectorAll("img")) {
    const style = getComputedStyle(img);
    const hasRatio = style.aspectRatio && style.aspectRatio !== "auto";
    if (!img.getAttribute("width") || !img.getAttribute("height")) {
      if (!hasRatio) {
        issues.push({
          type: "unsized-image",
          severity: "error",
          detail: `${describe(img)} (${img.getAttribute("src") ?? "sin src"}) no declara width/height ni aspect-ratio.`,
        });
      }
    }
    if (img.getAttribute("alt") === null) {
      issues.push({
        type: "missing-alt",
        severity: "error",
        detail: `${describe(img)} no tiene atributo alt (usa alt="" si es decorativa).`,
      });
    }
  }

  return issues;
};

const run = async () => {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const report = { url, section, widths: {}, generatedAt: new Date().toISOString() };
  let errorCount = 0;

  console.log(`\nQA responsive — ${section}`);
  console.log(`URL: ${url}\n`);

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: Math.round(width * 1.6) },
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 768,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    } catch {
      // networkidle puede no llegar nunca si hay polling; el DOM ya basta.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    }

    // Recorrer la página para disparar lazy-loading antes de auditar y capturar.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += window.innerHeight;
          if (y < document.body.scrollHeight) setTimeout(step, 60);
          else { window.scrollTo(0, 0); setTimeout(resolve, 200); }
        };
        step();
      });
    });

    const issues = await page.evaluate(audit, {
      minTap: MIN_TAP_TARGET,
      minFont: MIN_FONT_SIZE,
    });

    const shot = path.join(outDir, `${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });

    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");
    errorCount += errors.length;
    report.widths[width] = { screenshot: shot, issues };

    const mark = errors.length ? "✗" : warnings.length ? "!" : "✓";
    console.log(`${mark} ${String(width).padStart(4)}px  ${errors.length} error(es), ${warnings.length} aviso(s)  → ${shot}`);

    // Agrupar por tipo para no vomitar 300 líneas iguales
    const byType = new Map();
    for (const i of issues) {
      if (!byType.has(i.type)) byType.set(i.type, []);
      byType.get(i.type).push(i);
    }
    for (const [type, list] of byType) {
      const sev = list[0].severity === "error" ? "  ✗" : "  !";
      console.log(`${sev} ${type} (${list.length})`);
      for (const i of list.slice(0, 3)) console.log(`      ${i.detail}`);
      if (list.length > 3) console.log(`      … y ${list.length - 3} más`);
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(outDir, "report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nCapturas y reporte en ${outDir}/`);

  if (errorCount > 0) {
    console.error(`\n${errorCount} problema(s) de responsive. El bloque no cierra así.`);
    console.error("Ver references/responsive.md para qué se rompe en cada ancho.");
    if (ci) process.exit(1);
    process.exit(1);
  }

  console.log("\nSin problemas objetivos. Revisa los PNG antes de cerrar el bloque:");
  console.log("el script no puede juzgar si se ve bien.");
};

run().catch((err) => {
  console.error("Error al correr el QA responsive:", err.message);
  process.exit(2);
});
