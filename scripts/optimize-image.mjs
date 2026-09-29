#!/usr/bin/env node
/**
 * Genera las variantes web de una foto: WebP en varios anchos, sin metadatos y
 * sin ampliar nunca por encima del ancho original.
 *
 * Solo WebP: en fotos del tamaño que usa el sitio, AVIF pesa casi lo mismo y
 * agrega un formato más que limpiar y verificar (scripts/strip-image-metadata.mjs).
 *
 * Con --brand aplica la desaturación del manual de marca (0.34) dentro de la
 * imagen. Hacerlo en CSS con filter: saturate() obliga al navegador a
 * rasterizar la foto completa antes del primer pintado: en móvil retrasaba el
 * LCP más de un segundo. El tinte azul sí queda en CSS porque es una capa plana.
 *
 * Así cualquier foto nueva de marketing entra al sitio con el mismo proceso:
 * se deja el original en assets-src/ y se corre este script.
 *
 *   node scripts/optimize-image.mjs <entrada> <salida-sin-extensión> [anchos] [--brand]
 *   node scripts/optimize-image.mjs assets-src/foto-hero.jpg public/images/hero/obra 640,960,1280,1920 --brand
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_WIDTHS = [640, 960, 1280, 1920, 2560];
const WEBP_OPTIONS = { quality: 62, effort: 6 };
const BRAND_SATURATION = 0.34;

const args = process.argv.slice(2);
const applyBrand = args.includes("--brand");
const [input, outputBase, widthsArg] = args.filter((arg) => !arg.startsWith("--"));

if (!input || !outputBase) {
  process.stderr.write("Uso: node scripts/optimize-image.mjs <entrada> <salida-sin-extensión> [anchos separados por coma]\n");
  process.exit(2);
}

const requested = widthsArg
  ? widthsArg.split(",").map((value) => Number.parseInt(value, 10)).filter((value) => Number.isFinite(value) && value > 0)
  : DEFAULT_WIDTHS;

const { width: originalWidth, height: originalHeight } = await sharp(input).metadata();
if (!originalWidth || !originalHeight) {
  throw new Error(`No pude leer las dimensiones de ${input}.`);
}

const widths = [...new Set(requested.map((width) => Math.min(width, originalWidth)))].sort((a, b) => a - b);
await mkdir(path.dirname(outputBase), { recursive: true });

const written = [];
for (const width of widths) {
  const height = Math.round((originalHeight * width) / originalWidth);
  const resized = sharp(input).rotate().resize({ width, withoutEnlargement: true });
  const pipeline = applyBrand ? resized.modulate({ saturation: BRAND_SATURATION }) : resized;
  const webp = `${outputBase}-${width}.webp`;
  const info = await pipeline.webp(WEBP_OPTIONS).toFile(webp);
  written.push({ width, height, size: info.size });
}

process.stdout.write(`Original: ${originalWidth}×${originalHeight}\n`);
for (const entry of written) {
  process.stdout.write(`  ${entry.width}×${entry.height}  ${(entry.size / 1024).toFixed(1)} KB\n`);
}
if (requested.some((width) => width > originalWidth)) {
  process.stdout.write(`Aviso: el original mide ${originalWidth} px; los anchos mayores se omitieron para no ampliar.\n`);
}
