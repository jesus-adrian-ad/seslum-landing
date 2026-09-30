#!/usr/bin/env node
/**
 * Genera la imagen de vista previa al compartir el sitio (Open Graph):
 * 1200 × 630 px en JPG, sin metadatos y por debajo de 300 KB, que es el límite
 * práctico de WhatsApp para mostrarla.
 *
 * Arma la composición en HTML con la foto del encabezado, el logo, el eyebrow y
 * el título de hero.json, y el dominio de site.json; la renderiza con Chromium
 * (Playwright) y la comprime con sharp. Todo va centrado porque WhatsApp, en su
 * vista pequeña, recorta la imagen a un cuadrado desde el centro.
 *
 * Se vuelve a correr cuando cambia el logo, la foto del encabezado o su título:
 *
 *   npm run og:image
 */

import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 300 * 1024;
const JPEG_OPTIONS = { quality: 80, mozjpeg: true };
const OUTPUT = "public/images/og/seslum-og.jpg";

const dataUri = async (file, type) => `data:${type};base64,${(await readFile(file)).toString("base64")}`;
const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const hero = JSON.parse(await readFile("src/content/sections/hero.json", "utf8"));
const site = JSON.parse(await readFile("src/content/site.json", "utf8"));
const photo = await dataUri("assets-src/foto-hero.jpg", "image/jpeg");
const logo = await dataUri("public/images/brand/logo-seslum.svg", "image/svg+xml");
const font = await dataUri("src/fonts/SourceSans3-Variable-latin.woff2", "font/woff2");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Source Sans 3"; src: url(${font}) format("woff2"); font-weight: 300 900; }
* { box-sizing: border-box; margin: 0; }
body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #0b1120; font-family: "Source Sans 3", sans-serif; color: #f0f1fa; }
.photo { position: absolute; inset: 0; background: url(${photo}) center / cover; filter: saturate(0.34); }
.tint { position: absolute; inset: 0; background: rgb(17 78 129 / 0.42); }
.veil { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgb(11 17 32 / 0.72) 0%, rgb(11 17 32 / 0.9) 60%, rgb(11 17 32 / 0.97) 100%); }
.content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; text-align: center; padding: 64px; }
.logo { height: 78px; }
.eyebrow { color: #23b5e9; font-size: 22px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.title { max-width: 640px; font-size: 66px; font-weight: 900; line-height: 1.02; letter-spacing: -0.035em; text-wrap: balance; }
.domain { position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; color: rgb(240 241 250 / 0.74); font-size: 22px; font-weight: 600; letter-spacing: 0.04em; }
.bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: #23b5e9; }
</style></head><body>
<div class="photo"></div><div class="tint"></div><div class="veil"></div><div class="bar"></div>
<div class="content">
  <img class="logo" src="${logo}" alt="">
  <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
  <h1 class="title">${escapeHtml(hero.title)}</h1>
</div>
<p class="domain">${escapeHtml(new URL(site.url).host)}</p>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  const info = await sharp(png).jpeg(JPEG_OPTIONS).toFile(OUTPUT);
  process.stdout.write(`${OUTPUT}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(1)} KB\n`);
  if (info.size > MAX_BYTES) {
    process.stderr.write(`La imagen pesa más de ${MAX_BYTES / 1024} KB; WhatsApp podría no mostrarla.\n`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
