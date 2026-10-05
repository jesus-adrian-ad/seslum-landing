#!/usr/bin/env node
/**
 * Post-build: retrasa la carga del JavaScript de Next.js hasta después del
 * primer pintado.
 *
 * Next deja sus chunks como <script async> en el <head>. En móvil llegan y se
 * ejecutan antes de que el navegador pinte la foto del encabezado: la
 * hidratación de React ocupa el hilo principal y el LCP espera (en Lighthouse
 * móvil, más de un segundo de "render delay"). Aquí se quitan esas etiquetas y
 * se agrega un cargador en línea que las inserta, con los mismos atributos, en
 * el cuadro siguiente al primer pintado. El HTML ya trae todo el contenido
 * visible, así que el visitante ve la página antes; la interacción llega en
 * cuanto termina la hidratación, igual que antes.
 *
 * Corre antes de scripts/csp-hashes.mjs, que calcula el hash del cargador.
 * Falla el build si no encuentra los chunks o el script de arranque (id="_R_"),
 * para no publicar una página que nunca hidrate.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");
const CHUNK_TAG = /<script src="(\/_next\/static\/chunks\/[^"]+)"( id="_R_")? async=""><\/script>/g;
const BODY_END = "</body>";

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

function buildLoader(chunks) {
  const list = JSON.stringify(chunks);
  return (
    "<script>requestAnimationFrame(function(){setTimeout(function(){" +
    `${list}.forEach(function(c){var s=document.createElement("script");s.src=c.src;s.async=true;if(c.id)s.id=c.id;document.body.appendChild(s)})` +
    "},0)})</script>"
  );
}

async function main() {
  const files = await listHtmlFiles(OUT_DIR);
  let pages = 0;
  for (const file of files) {
    const html = await readFile(file, "utf8");
    const chunks = [...html.matchAll(CHUNK_TAG)].map(([, src, id]) => (id ? { src, id: "_R_" } : { src }));
    if (chunks.length === 0) continue;
    if (!chunks.some((chunk) => chunk.id === "_R_")) {
      throw new Error(`${path.relative(OUT_DIR, file)}: no encontré el script de arranque de Next (id="_R_").`);
    }
    if (html.split(BODY_END).length !== 2) {
      throw new Error(`${path.relative(OUT_DIR, file)} no tiene exactamente un ${BODY_END}.`);
    }
    const stripped = html.replace(CHUNK_TAG, "");
    await writeFile(file, stripped.replace(BODY_END, `${buildLoader(chunks)}${BODY_END}`));
    pages += 1;
  }
  if (pages === 0) {
    throw new Error("No encontré chunks de Next en ningún HTML; ¿cambió el formato del export?");
  }
  process.stdout.write(`Hidratación diferida al primer pintado en ${pages} página(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`defer-hydration: ${error.message}\n`);
  process.exitCode = 1;
});
