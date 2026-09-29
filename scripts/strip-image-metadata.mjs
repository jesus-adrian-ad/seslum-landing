#!/usr/bin/env node
/**
 * Quita metadatos de las imágenes publicadas (WebP, PNG y SVG): EXIF, XMP,
 * textos y manifiestos de procedencia (C2PA).
 *
 * Dos razones: los metadatos pesan (un manifiesto C2PA puede triplicar un logo
 * de 3 KB) y pueden filtrar datos del cliente, como la ubicación GPS de una foto
 * de obra. Con --check no modifica nada y falla si encuentra metadatos, para
 * usarse como gate en CI.
 *
 *   node scripts/strip-image-metadata.mjs            # limpia public/ y src/app
 *   node scripts/strip-image-metadata.mjs --check    # solo verifica
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["public", "src/app"];
const CHECK_ONLY = process.argv.includes("--check");

const WEBP_KEEP = new Set(["VP8 ", "VP8L", "VP8X", "ALPH", "ANIM", "ANMF", "ICCP"]);
const WEBP_FLAG_EXIF = 0x08;
const WEBP_FLAG_XMP = 0x04;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_KEEP = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT", "pHYs"]);

const SVG_METADATA = /<metadata\b[\s\S]*?<\/metadata>/gi;
const SVG_C2PA_NAMESPACE = /\s+xmlns:c2pa="[^"]*"/gi;

async function listImages(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listImages(full);
      return /\.(webp|png|svg)$/i.test(entry.name) ? [full] : [];
    }),
  );
  return nested.flat();
}

function stripWebp(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return { output: buffer, removed: [] };
  }
  const kept = [];
  const removed = [];
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const end = offset + 8 + size + (size % 2);
    const chunk = Buffer.from(buffer.subarray(offset, end));
    if (WEBP_KEEP.has(id)) {
      kept.push(chunk);
    } else {
      removed.push(id);
    }
    offset = end;
  }
  if (removed.length === 0) {
    return { output: buffer, removed };
  }
  for (const chunk of kept) {
    if (chunk.toString("ascii", 0, 4) === "VP8X") {
      chunk[8] &= ~(WEBP_FLAG_EXIF | WEBP_FLAG_XMP);
    }
  }
  const body = Buffer.concat(kept);
  const header = Buffer.alloc(12);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.length + 4, 4);
  header.write("WEBP", 8, "ascii");
  return { output: Buffer.concat([header, body]), removed };
}

function stripPng(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { output: buffer, removed: [] };
  }
  const kept = [PNG_SIGNATURE];
  const removed = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const size = buffer.readUInt32BE(offset);
    const id = buffer.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + size;
    if (PNG_KEEP.has(id)) {
      kept.push(buffer.subarray(offset, end));
    } else {
      removed.push(id);
    }
    offset = end;
  }
  return { output: removed.length > 0 ? Buffer.concat(kept) : buffer, removed };
}

function stripSvg(buffer) {
  const source = buffer.toString("utf8");
  const cleaned = source.replace(SVG_METADATA, "").replace(SVG_C2PA_NAMESPACE, "");
  return cleaned === source
    ? { output: buffer, removed: [] }
    : { output: Buffer.from(cleaned, "utf8"), removed: ["metadata"] };
}

function strip(file, buffer) {
  const extension = path.extname(file).toLowerCase();
  if (extension === ".webp") return stripWebp(buffer);
  if (extension === ".png") return stripPng(buffer);
  return stripSvg(buffer);
}

const files = (await Promise.all(ROOTS.map(listImages))).flat();
const dirty = [];

for (const file of files) {
  const buffer = await readFile(file);
  const { output, removed } = strip(file, buffer);
  if (removed.length === 0) continue;
  dirty.push(`${file} (${[...new Set(removed)].join(", ")}; ${buffer.length - output.length} bytes)`);
  if (!CHECK_ONLY) await writeFile(file, output);
}

if (dirty.length === 0) {
  process.stdout.write(`Imágenes sin metadatos (${files.length} revisadas).\n`);
  process.exit(0);
}

if (CHECK_ONLY) {
  process.stderr.write(`Imágenes con metadatos:\n${dirty.map((line) => `  ${line}`).join("\n")}\nCorre: npm run images:strip\n`);
  process.exit(1);
}
process.stdout.write(`Metadatos eliminados:\n${dirty.map((line) => `  ${line}`).join("\n")}\n`);
