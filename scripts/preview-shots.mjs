#!/usr/bin/env node
/**
 * preview-shots.mjs — renderiza las variantes de preview de una sección a PNG.
 *
 * Antes de escribir el código de una sección se muestran 3 direcciones visuales.
 * Este script convierte cada variante (un HTML autocontenido) en dos PNG:
 * escritorio (1440) y móvil (375), que es lo que se le entrega a Adrián para
 * que elija.
 *
 * Los mismos PNG sirven para los mockups del PPTX de propuesta en Fase 0.
 *
 * Estructura esperada:
 *   .previews/<seccion>/variante-1.html
 *   .previews/<seccion>/variante-2.html
 *   .previews/<seccion>/variante-3.html
 *
 * Uso:
 *   node scripts/preview-shots.mjs --section hero
 *   node scripts/preview-shots.mjs --section hero --widths 375,768,1440
 *
 * `.previews/` va en .gitignore: es material de trabajo, no del repo.
 *
 * Requiere Playwright:  npm i -D playwright && npx playwright install chromium
 */

import { chromium } from "playwright";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const getArg = (flag, fallback = null) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const section = getArg("--section");
const baseDir = getArg("--dir", section ? path.join(".previews", section) : null);
const widths = getArg("--widths", "375,1440")
  .split(",")
  .map((w) => parseInt(w.trim(), 10))
  .filter(Boolean);

if (!section && !baseDir) {
  console.error("Falta --section. Ejemplo:");
  console.error("  node scripts/preview-shots.mjs --section hero");
  process.exit(2);
}

const run = async () => {
  let files;
  try {
    files = (await readdir(baseDir))
      .filter((f) => f.endsWith(".html"))
      .sort();
  } catch {
    console.error(`No existe ${baseDir}/`);
    console.error("Crea ahí las variantes como variante-1.html, variante-2.html, …");
    process.exit(2);
  }

  if (files.length === 0) {
    console.error(`No hay archivos .html en ${baseDir}/`);
    process.exit(2);
  }

  const outDir = path.join(baseDir, "png");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  console.log(`\nPreviews de "${section ?? baseDir}" — ${files.length} variante(s)\n`);

  for (const file of files) {
    const name = path.basename(file, ".html");
    const fileUrl = pathToFileURL(path.resolve(baseDir, file)).href;

    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: Math.round(width * 1.6) },
        deviceScaleFactor: 2, // 2x: se ven nítidos en el PPTX y en pantallas retina
        isMobile: width < 768,
      });
      const page = await context.newPage();
      await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 30000 });

      // Dar tiempo a que las fuentes web se apliquen antes de capturar; si no,
      // el PNG sale con la tipografía de sistema y la comparación es engañosa.
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(300);

      const out = path.join(outDir, `${name}-${width}.png`);
      await page.screenshot({ path: out, fullPage: true });
      console.log(`✓ ${name} @ ${width}px → ${out}`);

      await context.close();
    }
  }

  await browser.close();

  console.log(`\nListo. PNG en ${outDir}/`);
  console.log("Entrégaselos a Adrián con una frase por variante:");
  console.log("qué idea propone cada una y en qué se diferencia de las otras.");
};

run().catch((err) => {
  console.error("Error al renderizar previews:", err.message);
  process.exit(2);
});
