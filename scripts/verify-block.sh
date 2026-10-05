#!/usr/bin/env bash
#
# verify-block.sh — corre todos los gates de un bloque antes de abrir el PR.
#
# Los mismos comandos que corren en CI (.github/workflows/quality-gates.yml).
# Correrlos aquí primero evita gastar un ciclo de revisión descubriendo un rojo
# que se podía ver en 30 segundos.
#
#   ./scripts/verify-block.sh --url http://localhost:4321
#   ./scripts/verify-block.sh --url http://localhost:4321 --skip lighthouse
#
# Salida 0 = todos los gates en verde. Cualquier otra = hay algo que arreglar.

set -uo pipefail

URL=""
SKIP=""
DIST_DIR="dist"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)  URL="$2"; shift 2 ;;
    --skip) SKIP="$SKIP $2"; shift 2 ;;
    --dist) DIST_DIR="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "Opción desconocida: $1" >&2; exit 2 ;;
  esac
done

RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[0;33m'
BOLD=$'\033[1m'; NC=$'\033[0m'

FAILED=()
PASSED=()
SKIPPED=()

skipped() { [[ " $SKIP " == *" $1 "* ]]; }

have() { command -v "$1" >/dev/null 2>&1; }

run_gate() {
  local id="$1" label="$2"; shift 2
  if skipped "$id"; then
    SKIPPED+=("$label"); printf '%s⊘ %s (omitido)%s\n' "$YELLOW" "$label" "$NC"; return 0
  fi
  printf '\n%s▸ %s%s\n' "$BOLD" "$label" "$NC"
  if "$@"; then
    PASSED+=("$label"); printf '%s✓ %s%s\n' "$GREEN" "$label" "$NC"
  else
    FAILED+=("$label"); printf '%s✗ %s%s\n' "$RED" "$label" "$NC"
  fi
}

# --- Gate 1: secretos --------------------------------------------------------
gate_secrets() {
  if ! have gitleaks; then
    echo "gitleaks no está instalado. Instálalo con:"
    echo "  brew install gitleaks   # macOS"
    echo "  # o descarga el binario de github.com/gitleaks/gitleaks/releases"
    return 1
  fi
  local cfg=()
  [[ -f .gitleaks.toml ]] && cfg=(--config .gitleaks.toml)
  gitleaks detect --source . "${cfg[@]}" --redact --no-banner
}

# --- Gate 2: dependencias ----------------------------------------------------
gate_deps() {
  local ok=0
  if [[ -f package.json ]]; then
    npm run --silent audit:gate || ok=1
  else
    echo "Sin package.json; se omite npm audit."
  fi

  if have osv-scanner; then
    local lock=""
    for f in package-lock.json pnpm-lock.yaml yarn.lock; do
      [[ -f "$f" ]] && lock="$f" && break
    done
    if [[ -n "$lock" ]]; then
      osv-scanner scan --lockfile="$lock" || ok=1
    else
      echo "Sin lockfile; se omite OSV-Scanner."
    fi
  else
    echo "${YELLOW}osv-scanner no instalado — se omite esa mitad del gate.${NC}"
    echo "  go install github.com/google/osv-scanner/v2/cmd/osv-scanner@latest"
    echo "  # o brew install osv-scanner"
  fi
  return $ok
}

# --- Gate 3: SAST ------------------------------------------------------------
gate_sast() {
  if ! have semgrep; then
    echo "semgrep no está instalado:  pipx install semgrep"
    return 1
  fi
  local cfg=(--config=p/default --config=p/secrets)
  [[ -f .semgrep.yml ]] && cfg+=(--config=.semgrep.yml)
  semgrep scan "${cfg[@]}" --error --metrics=off --quiet
}

# --- Gate 4: cabeceras de seguridad -----------------------------------------
gate_headers() {
  local f="public/_headers"
  if [[ ! -f "$f" ]]; then
    echo "Falta $f — las cabeceras de seguridad no están configuradas."
    return 1
  fi
  # Solo las líneas activas: el archivo lleva comentarios con variantes de CSP
  # que mencionan unsafe-inline a propósito, y no deben disparar el gate.
  local active
  active="$(grep -vE '^\s*#' "$f" || true)"

  local missing=()
  for h in Content-Security-Policy Strict-Transport-Security \
           X-Content-Type-Options X-Frame-Options \
           Referrer-Policy Permissions-Policy; do
    grep -q "$h" <<<"$active" || missing+=("$h")
  done
  if (( ${#missing[@]} )); then
    printf 'Cabeceras faltantes en %s: %s\n' "$f" "${missing[*]}"
    return 1
  fi
  if grep -Eq "unsafe-inline|unsafe-eval" <<<"$active"; then
    echo "La CSP activa contiene unsafe-inline o unsafe-eval."
    echo "Usa hashes o nonces; abrir la política anula el control."
    grep -nE "unsafe-inline|unsafe-eval" "$f" | grep -vE ':\s*#' || true
    return 1
  fi
  echo "Cabeceras presentes y CSP sin unsafe-*."
}

# --- Gate 5: Lighthouse ------------------------------------------------------
gate_lighthouse() {
  if [[ ! -d "$DIST_DIR" ]]; then
    echo "No existe $DIST_DIR/. Corre el build primero (npm run build)."
    return 1
  fi
  if [[ ! -f lighthouserc.json ]]; then
    echo "Falta lighthouserc.json en la raíz."
    return 1
  fi
  npx --yes @lhci/cli@0.15.x autorun --config=./lighthouserc.json
}

# --- Gate 6: axe-core --------------------------------------------------------
gate_axe() {
  if [[ -z "$URL" ]]; then
    echo "axe-core necesita una URL. Pasa --url http://localhost:PUERTO"
    return 1
  fi
  node scripts/axe-check.mjs --url "$URL"
}

# --- Gate 7: responsive ------------------------------------------------------
gate_responsive() {
  if [[ -z "$URL" ]]; then
    echo "El QA responsive necesita una URL. Pasa --url http://localhost:PUERTO"
    return 1
  fi
  node scripts/responsive-shots.mjs --url "$URL" --ci
}

# --- Preflight ---------------------------------------------------------------
# Avisar de una vez qué falta, en lugar de descubrirlo gate por gate.
preflight() {
  local missing=()
  have gitleaks     || missing+=("gitleaks|brew install gitleaks  ·  o el binario de github.com/gitleaks/gitleaks/releases")
  have semgrep      || missing+=("semgrep|pipx install semgrep")
  have osv-scanner  || missing+=("osv-scanner|brew install osv-scanner  ·  o go install github.com/google/osv-scanner/v2/cmd/osv-scanner@latest")
  have node         || missing+=("node|necesario para el QA responsive")
  (( ${#missing[@]} == 0 )) && return 0
  printf '\n%sHerramientas faltantes:%s\n' "$YELLOW" "$NC"
  for m in "${missing[@]}"; do
    printf '  %-14s %s\n' "${m%%|*}" "${m#*|}"
  done
  printf 'Los gates que dependan de ellas van a fallar.\n'
}

# --- Ejecución ---------------------------------------------------------------
printf '%s═══ Gates del bloque ═══%s\n' "$BOLD" "$NC"
[[ -n "$URL" ]] && echo "URL: $URL"
preflight

run_gate secrets    "Secretos (Gitleaks)"              gate_secrets
run_gate deps       "Dependencias (npm audit + OSV)"   gate_deps
run_gate sast       "Código (Semgrep)"                 gate_sast
run_gate headers    "Cabeceras de seguridad"           gate_headers
run_gate lighthouse "Web (Lighthouse CI)"              gate_lighthouse
run_gate axe        "Accesibilidad (axe-core)"         gate_axe
run_gate responsive "Responsive (7 anchos)"            gate_responsive

# --- Resumen -----------------------------------------------------------------
echo
printf '%s═══ Resumen ═══%s\n' "$BOLD" "$NC"
for g in "${PASSED[@]}";  do printf '%s✓%s %s\n' "$GREEN"  "$NC" "$g"; done
for g in "${SKIPPED[@]}"; do printf '%s⊘%s %s\n' "$YELLOW" "$NC" "$g"; done
for g in "${FAILED[@]}";  do printf '%s✗%s %s\n' "$RED"    "$NC" "$g"; done

if (( ${#FAILED[@]} )); then
  echo
  printf '%s%d gate(s) en rojo. No abras el PR todavía.%s\n' "$RED" "${#FAILED[@]}" "$NC"
  echo "Arregla la causa; bajar el umbral no cuenta como arreglo."
  echo "Ver references/seguridad.md y references/calidad-web.md."
  exit 1
fi

echo
printf '%sTodos los gates en verde. Listo para el PR.%s\n' "$GREEN" "$NC"
