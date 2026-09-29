#!/usr/bin/env node
/**
 * Gate de accesibilidad: corre axe-core con Playwright en móvil y escritorio.
 *
 * Sustituye a @axe-core/cli, que depende de que ChromeDriver y Chrome tengan la
 * misma versión y se rompe cada vez que el runner actualiza uno sin el otro.
 * Falla con violaciones serious o critical; las demás se reportan como aviso.
 * Se audita con movimiento reducido para medir el estado final de la página y no
 * un fotograma a mitad de una animación de entrada (el contraste saldría falso).
 *
 *   node scripts/axe-check.mjs --url http://localhost:8788
 */

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const url = urlIndex !== -1 ? args[urlIndex + 1] : null;

if (!url) {
  process.stderr.write("Falta --url. Ejemplo: node scripts/axe-check.mjs --url http://localhost:8788\n");
  process.exit(2);
}

const browser = await chromium.launch();
let blocking = 0;

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  await context.close();

  const label = `${viewport.width}px`;
  if (violations.length === 0) {
    process.stdout.write(`✓ ${label}: 0 violaciones\n`);
    continue;
  }
  for (const violation of violations) {
    const isBlocking = BLOCKING_IMPACTS.has(violation.impact ?? "");
    if (isBlocking) blocking += 1;
    const mark = isBlocking ? "✗" : "!";
    process.stdout.write(`${mark} ${label}: ${violation.impact} ${violation.id} (${violation.nodes.length} nodo(s)) — ${violation.help}\n`);
    for (const node of violation.nodes.slice(0, 3)) {
      process.stdout.write(`    ${node.target.join(" ")}\n`);
    }
  }
}

await browser.close();

if (blocking > 0) {
  process.stderr.write(`\n${blocking} violación(es) serious/critical. El bloque no cierra así.\n`);
  process.exit(1);
}
process.stdout.write("Accesibilidad sin violaciones serious/critical.\n");
