#!/usr/bin/env node
/**
 * Post-build de GTM: lee out/gtm.json, que genera src/app/gtm.json/route.ts, y
 * coloca los fragmentos oficiales de Google en cada página HTML de out/. Los
 * scripts del `<head>` van justo después del `<meta charset>` (lo más arriba
 * posible sin sacar el charset de los primeros bytes) y el `<noscript>` justo
 * después de abrir el `<body>`. Los fragmentos llegan ya armados desde un ID
 * validado (src/lib/gtm.ts), así que este script solo los coloca.
 *
 * Con el manifiesto vacío no inserta nada. Falla el build si falta el
 * manifiesto, si una página ya trae GTM o si no tiene exactamente un charset y un
 * `<body>`: así nunca se publica duplicado ni a medias. Corre antes de
 * csp-hashes.mjs, que calcula los hashes de estos scripts.
 */

import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");
const MANIFEST = path.join(OUT_DIR, "gtm.json");
const CHARSET_PATTERN = /<meta charSet="utf-8"\/>/gi;
const BODY_PATTERN = /<body\b[^>]*>/gi;
const GTM_MARKER = "googletagmanager.com/gtm.js";

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return nested.flat();
}

function insertAfterSingle(html, pattern, insertion, page, label) {
  const matches = html.match(pattern) ?? [];
  if (matches.length !== 1) {
    throw new Error(`${page} no tiene exactamente un ${label}.`);
  }
  return html.replace(matches[0], `${matches[0]}${insertion}`);
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  await rm(MANIFEST);
  if (!manifest.headScripts) {
    process.stdout.write("GTM: sin contenedor, no se instala.\n");
    return;
  }
  const headScripts = manifest.headScripts.map((script) => `<script>${script}</script>`).join("");
  const files = await listHtmlFiles(OUT_DIR);
  for (const file of files) {
    const page = path.relative(OUT_DIR, file);
    const html = await readFile(file, "utf8");
    if (html.includes(GTM_MARKER)) {
      throw new Error(`${page} ya trae GTM; los fragmentos solo se insertan aquí.`);
    }
    const withHead = insertAfterSingle(html, CHARSET_PATTERN, headScripts, page, "<meta charset>");
    await writeFile(file, insertAfterSingle(withHead, BODY_PATTERN, manifest.bodyHtml, page, "<body>"));
  }
  process.stdout.write(`GTM: fragmentos insertados en ${files.length} página(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`inline-gtm: ${error.message}\n`);
  process.exitCode = 1;
});
