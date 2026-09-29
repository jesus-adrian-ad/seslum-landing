#!/usr/bin/env node
/**
 * Humo de consola: abre el sitio servido con sus cabeceras reales (wrangler
 * pages dev) y falla si hay errores, advertencias o violaciones de CSP.
 *
 * Lighthouse mide el build sin cabeceras, así que no ve la CSP. Este script
 * cubre ese hueco: una CSP que bloquea un script de hidratación no da error
 * visible, pero deja la página sin interactividad.
 *
 *   node scripts/console-smoke.mjs --url http://localhost:8788
 */

import { chromium } from "playwright";

const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const url = urlIndex !== -1 ? args[urlIndex + 1] : null;

if (!url) {
  process.stderr.write("Falta --url. Ejemplo: node scripts/console-smoke.mjs --url http://localhost:8788\n");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];

page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    problems.push(`[${message.type()}] ${message.text()}`);
  }
});
page.on("pageerror", (error) => problems.push(`[pageerror] ${error.message}`));

await page.exposeFunction("reportCspViolation", (detail) => problems.push(`[csp] ${detail}`));
await page.addInitScript(() => {
  document.addEventListener("securitypolicyviolation", (event) => {
    window.reportCspViolation(`${event.violatedDirective} bloqueó ${event.blockedURI || "contenido en línea"}`);
  });
});

const response = await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await browser.close();

const csp = response?.headers()["content-security-policy"];
if (!csp) problems.push("[headers] La respuesta no trae Content-Security-Policy; ¿se está sirviendo con wrangler pages dev?");

if (problems.length > 0) {
  process.stderr.write(`Consola con ${problems.length} problema(s) en ${url}:\n${problems.map((p) => `  ${p}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`Consola limpia y CSP activa en ${url}.\n`);
