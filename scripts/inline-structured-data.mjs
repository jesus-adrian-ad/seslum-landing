#!/usr/bin/env node
/**
 * Post-build de los datos estructurados: lee out/structured-data.json, que
 * genera src/app/structured-data.json/route.ts, inserta cada bloque JSON-LD
 * antes de </body> en su página y borra el manifiesto de out/.
 *
 * Los bloques llegan ya serializados y escapados (serializeJsonLd), así que
 * este script solo los coloca. Falla el build si falta el manifiesto, si una
 * página no existe o si ya tiene JSON-LD: así nunca se publica duplicado ni a medias.
 */

import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");
const MANIFEST = path.join(OUT_DIR, "structured-data.json");
const BODY_END = "</body>";
const JSON_LD_TAG = '<script type="application/ld+json">';

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  let blocks = 0;
  for (const [page, entries] of Object.entries(manifest)) {
    const file = path.join(OUT_DIR, page);
    const html = await readFile(file, "utf8");
    if (html.includes(JSON_LD_TAG)) {
      throw new Error(`${page} ya trae JSON-LD; los datos estructurados solo se insertan aquí.`);
    }
    if (html.split(BODY_END).length !== 2) {
      throw new Error(`${page} no tiene exactamente un ${BODY_END}.`);
    }
    const scripts = entries.map((json) => `${JSON_LD_TAG}${json}</script>`).join("");
    await writeFile(file, html.replace(BODY_END, `${scripts}${BODY_END}`));
    blocks += entries.length;
  }
  await rm(MANIFEST);
  process.stdout.write(`JSON-LD: ${blocks} bloque(s) insertado(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`inline-structured-data: ${error.message}\n`);
  process.exitCode = 1;
});
