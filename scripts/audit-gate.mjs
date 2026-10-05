#!/usr/bin/env node
/**
 * Gate de dependencias: falla con cualquier aviso high o critical de npm audit,
 * salvo los que audit-allowlist.json acepta por ID exacto y hasta su fecha de
 * vencimiento.
 *
 * Existe porque npm audit no permite ignorar un aviso puntual: la alternativa
 * sería bajar el nivel o auditar solo producción, que deja de vigilar todo lo
 * demás. Una entrada vencida hace fallar el gate; una que ya no aparece se
 * reporta para quitarla.
 */

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const BLOCKING = new Set(["high", "critical"]);
const ALLOWLIST = new URL("../audit-allowlist.json", import.meta.url);
const ADVISORY_ID = /GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/;

function runAudit() {
  try {
    return execFileSync("npm", ["audit", "--json"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.trim() !== "") {
      return error.stdout;
    }
    throw error;
  }
}

function blockingAdvisories(report) {
  const found = new Map();
  for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const via of vulnerability.via) {
      if (typeof via !== "object" || !BLOCKING.has(via.severity)) continue;
      const id = via.url?.match(ADVISORY_ID)?.[0] ?? String(via.source);
      found.set(id, { id, name: via.name, severity: via.severity, title: via.title });
    }
  }
  return [...found.values()];
}

async function main() {
  const { advisories: allowed } = JSON.parse(await readFile(ALLOWLIST, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const expired = allowed.filter((entry) => entry.until < today);
  const active = new Map(allowed.filter((entry) => entry.until >= today).map((entry) => [entry.id, entry]));

  const advisories = blockingAdvisories(JSON.parse(runAudit()));
  const blocking = advisories.filter((advisory) => !active.has(advisory.id));
  const accepted = advisories.filter((advisory) => active.has(advisory.id));
  const stale = [...active.keys()].filter((id) => !advisories.some((advisory) => advisory.id === id));

  for (const advisory of accepted) {
    const entry = active.get(advisory.id);
    process.stdout.write(`Aceptado hasta ${entry.until}: ${advisory.id} (${advisory.name}). ${entry.reason}\n`);
  }
  for (const id of stale) {
    process.stdout.write(`Ya no aparece ${id}: quítalo de audit-allowlist.json y osv-scanner.toml.\n`);
  }
  for (const entry of expired) {
    process.stderr.write(`Excepción vencida el ${entry.until}: ${entry.id} (${entry.package}).\n`);
  }
  for (const advisory of blocking) {
    process.stderr.write(`${advisory.severity}: ${advisory.id} en ${advisory.name} — ${advisory.title}\n`);
  }

  if (blocking.length > 0 || expired.length > 0) {
    process.exitCode = 1;
    return;
  }
  process.stdout.write("Dependencias sin avisos high/critical fuera de las excepciones vigentes.\n");
}

main().catch((error) => {
  process.stderr.write(`audit-gate: ${error.message}\n`);
  process.exitCode = 1;
});
