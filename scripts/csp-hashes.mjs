#!/usr/bin/env node
/**
 * Post-build de la CSP: calcula el SHA-256 de cada script en línea que Next.js
 * deja en el HTML exportado y lo inyecta en out/_headers.
 *
 * Falla el build si encuentra estilos en línea (atributo style o etiqueta
 * <style>), si el marcador no existe o si queda sin sustituir. Así la CSP
 * estricta nunca se publica a medias.
 */

import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");
const HEADERS_FILE = path.join(OUT_DIR, "_headers");
const MARKER = "__INLINE_SCRIPT_HASHES__";
const EXECUTABLE_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);

const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const TYPE_PATTERN = /\btype\s*=\s*["']?([^"'\s>]+)/i;
const SRC_PATTERN = /\bsrc\s*=/i;
const INLINE_STYLE_PATTERN = /<style\b|\sstyle\s*=\s*["']/i;

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

function inlineScriptBodies(html) {
  const bodies = [];
  for (const [, attrs, body] of html.matchAll(SCRIPT_PATTERN)) {
    if (SRC_PATTERN.test(attrs)) continue;
    const type = (attrs.match(TYPE_PATTERN)?.[1] ?? "").toLowerCase();
    if (!EXECUTABLE_TYPES.has(type)) continue;
    bodies.push(body);
  }
  return bodies;
}

const toHashSource = (body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`;

async function main() {
  const files = await listHtmlFiles(OUT_DIR);
  if (files.length === 0) {
    throw new Error(`No hay HTML en ${OUT_DIR}. ¿Corrió next build?`);
  }

  const hashes = new Set();
  const inlineStyleOffenders = [];
  for (const file of files) {
    const html = await readFile(file, "utf8");
    if (INLINE_STYLE_PATTERN.test(html)) inlineStyleOffenders.push(path.relative(OUT_DIR, file));
    for (const body of inlineScriptBodies(html)) hashes.add(toHashSource(body));
  }

  if (inlineStyleOffenders.length > 0) {
    throw new Error(
      `Estilos en línea en: ${inlineStyleOffenders.join(", ")}. La CSP (style-src 'self') los bloquearía; muévelos a una hoja de estilos.`,
    );
  }

  const headers = await readFile(HEADERS_FILE, "utf8");
  if (!headers.includes(MARKER)) {
    throw new Error(`${HEADERS_FILE} no contiene el marcador ${MARKER}.`);
  }
  const updated = headers.split(MARKER).join([...hashes].sort().join(" "));
  if (updated.includes(MARKER)) {
    throw new Error("El marcador de hashes quedó sin sustituir.");
  }
  await writeFile(HEADERS_FILE, updated);

  process.stdout.write(`CSP: ${hashes.size} hash(es) de scripts en línea en ${files.length} HTML.\n`);
}

main().catch((error) => {
  process.stderr.write(`csp-hashes: ${error.message}\n`);
  process.exit(1);
});
