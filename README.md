# Grupo SESLUM — Landing Page

Sitio de una página para Grupo SESLUM, integrador de seguridad electrónica,
protección contra incendios e infraestructura en Monterrey. Su objetivo es que
las empresas soliciten cotización.

**Producción:** https://seslum.com.mx (pendiente) · **Staging:** alias `develop` en Cloudflare Pages · **Repo:** GitHub (privado)

Desarrollado por [YiSoft Development](https://yisoft-development.com): páginas web
y sistemas para tu negocio.

---

## Estado del proyecto

| # | Sección | Rama | Estado | PR |
|---|---|---|---|---|
| 0 | Fundaciones | `feature/foundations` | 🔨 En PR | — |
| 1 | Navbar | `feature/navbar` | ⏳ Pendiente | — |
| 2 | Encabezado | `feature/hero` | ⏳ Pendiente | — |
| 3 | Servicios | `feature/services` | ⏳ Pendiente | — |
| 4 | Sectores | `feature/sectors` | ⏳ Pendiente | — |
| 5 | Por qué SESLUM | `feature/why-seslum` | ⏳ Pendiente | — |
| 6 | Proyectos | `feature/projects` | ⏳ Pendiente | — |
| 7 | Marcas y aliados | `feature/brands` | ⏳ Pendiente | — |
| 8 | Preguntas frecuentes | `feature/faq` | ⏳ Pendiente | — |
| 9 | Contacto | `feature/contact` | ⏳ Pendiente | — |
| 10 | Formulario | `feature/contact-form` | ⏳ Pendiente | — |
| 11 | Pie de página | `feature/footer` | ⏳ Pendiente | — |
| 12 | Consentimiento | `feature/consent-banner` | ⏳ Pendiente | — |

**Siguiente bloque:** 1 · Navbar

---

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router), exportación estática (`output: "export"`) |
| Lenguaje | TypeScript estricto |
| Estilos | CSS plano con design tokens |
| Animación | GSAP (a partir del bloque 2) |
| Formularios | Cloudflare Pages Function (bloque 10) |
| Medición | Google Tag Manager → GA4, con Consent Mode v2 |
| Pruebas | Vitest (`src/lib`) |
| Gestor de paquetes | npm |
| Hosting | Cloudflare Pages (Direct Upload desde GitHub Actions) |

Requiere Node.js ≥ 22.12.

---

## Cómo correrlo

```bash
npm ci
npm run dev          # http://localhost:3000 — desarrollo, sin cabeceras de seguridad
npm run build        # exporta a out/ en modo staging (no indexable) y calcula los hashes de la CSP
npm run build:audit  # igual, pero en modo producción: es el que se audita con Lighthouse
npm run preview      # http://localhost:8788 — sirve out/ con las cabeceras reales de Pages
npm run lint         # ESLint, cero advertencias
npm run typecheck
npm test
```

`npm run preview` es la forma correcta de revisar el sitio antes de un PR: aplica
`_headers`, así que una CSP que bloquee algo se ve en la consola.

Para auditar con Lighthouse usa `npm run build:audit`. Con `npm run build` el sitio
sale como staging (`noindex` y `robots.txt` con `Disallow: /`) y SEO marca ~66: es
lo esperado, así se protege el preview de ser indexado.

### Variables de entorno

Copia `.env.example` a `.env.local`. Los valores reales viven en el gestor de
contraseñas de YiSoft, en las variables del repo de GitHub y en Cloudflare, nunca
en este repo.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SITE_ENV` | `production` solo en `main`. Cualquier otro valor marca el sitio como no indexable. |
| `NEXT_PUBLIC_GTM_ID` | Contenedor de GTM. Vacío = no se carga GTM. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SECRET_KEY` · `CONTACT_FORM_TO` | Formulario (bloque 10). |

---

## Estructura

```
src/
├── app/                    # rutas de Next: layout, página, 404, robots, sitemap, ícono
├── components/             # piezas reutilizables (TagManager, StructuredData)
├── content/site.json       # datos del cliente: nombre, contacto, horario, SEO
├── fonts/                  # Source Sans 3 variable (OFL)
├── lib/                    # lógica pura y probada: medición, consentimiento, GTM, SEO, JSON-LD
├── sections/               # una por bloque (a partir del bloque 1)
├── styles/
│   ├── tokens.css          # único lugar con valores de diseño literales
│   ├── base.css            # reset y utilidades globales
│   └── pages/              # estilos por página
└── types/content.ts        # contratos de tipos del contenido
public/_headers             # cabeceras de seguridad (plantilla de la CSP)
scripts/                    # gates, QA responsive, hashes de CSP y humo de consola
```

Principio: cada archivo tiene una sola razón para cambiar. Detalle del proyecto en `SPEC.md`.

---

## Secciones

### 0 · Fundaciones

- Next.js 16 en exportación estática, TypeScript estricto, ESLint y Vitest.
- Design tokens de SESLUM y fuente Source Sans 3 autoalojada: una sola petición
  de 28 KB, precargada y con `font-display: swap`.
- Layout base con `lang="es-MX"`, enlace para saltar al contenido, metadatos,
  canonical, Open Graph, JSON-LD `LocalBusiness`, `robots.txt` y `sitemap.xml`.
  En staging el sitio es no indexable.
- Google Tag Manager con Consent Mode v2: todo denegado por defecto. El contenedor
  se descarga cuando la página terminó de cargar y el hilo principal está libre.
- Helper `trackEvent` para los eventos de conversión (`src/lib/analytics.ts`).
- CSP estricta con hashes calculados en cada build y página 404 propia.
- Workflow de CI con los gates y despliegue por Direct Upload.
- Marcador temporal en la página principal, que se retira con el primer bloque visible.

---

## Design system

Tokens en `src/styles/tokens.css`.

| Token | Valor | Uso |
|---|---|---|
| `--color-navy` | `#142036` | Fondo principal |
| `--color-void` | `#0B1120` | Secciones alternas |
| `--color-raised` | `#1A2942` | Tarjetas |
| `--color-deep` | `#114E81` | Tinte de fotos |
| `--color-mid` | `#0D71B2` | Botones sobre fondo claro |
| `--color-signal` | `#23B5E9` | Acento y CTA sobre oscuro; no usar sobre blanco |
| `--color-paper` | `#F0F1FA` | Texto principal |

**Tipografía:** Source Sans 3 variable, pesos 300 a 900.
**Firma visual:** esquinas biseladas (`.chamfer-lg`, `.chamfer-md`, `.chamfer-sm`).
**Breakpoints:** 375 · 768 · 1024 · 1180 (navbar) · 1440 (mobile-first, `min-width`).
**QA responsive:** 320 · 375 · 425 · 768 · 1024 · 1440 · 2560.

---

## Medición

GTM es la única etiqueta de medición en el código. GA4 y Google Ads se configuran
desde GTM, con las cuentas a nombre de Grupo SESLUM.

| Evento | Se dispara cuando | Parámetros |
|---|---|---|
| `generate_lead` | El formulario se envía correctamente (evento clave en GA4) | `source` |
| `click_whatsapp` | Clic en cualquier enlace de WhatsApp | `source` |
| `click_phone` | Clic en un enlace `tel:` | `source` |
| `click_email` | Clic en un enlace `mailto:` | `source` |

`source`: `header`, `hero`, `contact`, `footer`, `floating` o `form`. Los eventos
se conectan en los bloques que contienen esos enlaces.

---

## Calidad y seguridad

Gates en cada PR (`.github/workflows/quality-gates.yml`):

| Gate | Herramienta | Umbral |
|---|---|---|
| Secretos | Gitleaks | 0 hallazgos |
| Dependencias | npm audit + OSV-Scanner | 0 high/critical |
| Código | Semgrep (`p/default`, `p/secrets` y reglas propias) + ESLint + tsc + Vitest | 0 hallazgos, 0 advertencias |
| Cabeceras | Verificación de `public/_headers` | CSP sin `unsafe-*` |
| Web | Lighthouse CI (build de producción) | ≥ 90 en las 4 categorías (móvil) |
| Consola | `scripts/console-smoke.mjs` sobre `wrangler pages dev` | 0 errores, advertencias o violaciones de CSP |
| Accesibilidad | axe-core | 0 serious/critical |
| Responsive | `scripts/responsive-shots.mjs` | Sin errores en los 7 anchos |

En local, con `npm run preview` corriendo en otra terminal:

```bash
npm run build:audit
./scripts/verify-block.sh --dist out --url http://localhost:8788
node scripts/console-smoke.mjs --url http://localhost:8788
node scripts/responsive-shots.mjs --url http://localhost:8788 --section <slug>
```

### Excepciones vigentes

| Qué | Por qué | Desde | Qué haría falta para quitarla |
|---|---|---|---|
| `prefer-rest-params` apagado solo en `TagManager.tsx` | Consent Mode de GTM solo reconoce comandos publicados como objeto `arguments`; con un arreglo, los ignora sin avisar | 28/sep/2026 | Que Google acepte arreglos en el `dataLayer` para comandos de consentimiento |
| `network-dependency-tree-insight` como advertencia en Lighthouse | Es un *insight* informativo de Lighthouse 12.6 que no afecta la calificación; el preset lo evalúa como error | 28/sep/2026 | Que el preset de LHCI lo excluya |
| ESLint 9 en lugar de 10 | `eslint-plugin-react` (incluido en `eslint-config-next`) todavía no es compatible con ESLint 10 | 28/sep/2026 | Soporte de ESLint 10 en `eslint-plugin-react` |

---

## Despliegue

`main` → producción · `develop` → staging · cada PR → preview propio, con la URL
comentada en el PR.

El despliegue lo hace GitHub Actions con `wrangler pages deploy`, solo si todos
los gates están en verde. Cloudflare nunca tiene acceso a este repo.

**Alta (una vez):**

1. En la cuenta de Cloudflare de Grupo SESLUM: Workers & Pages → Create → Pages →
   *Upload assets* → nombre del proyecto (`seslum-landing`) → rama de producción `main`.
2. My Profile → API Tokens → Create token → *Custom*: permiso
   `Account · Cloudflare Pages · Edit`, limitado a la cuenta de Grupo SESLUM.
3. En GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
   - Variables: `CF_PAGES_PROJECT=seslum-landing`, `GTM_ID` (cuando exista).

**Rollback:** revertir el merge en `main` y hacer push, o promover un deployment
anterior desde el panel de Pages.

---

## Mantenimiento

- **Cambiar un texto o un dato de contacto:** `src/content/`. No hace falta tocar código.
- **Cambiar un color o la tipografía:** `src/styles/tokens.css`.
- **Agregar una sección:** método de bloques: rama, gates, PR a `develop`.
- **Actualizar dependencias:** Dependabot abre PRs semanales contra `develop`;
  se mergean solo con los gates en verde.

---

## Decisiones

- **28/sep/2026** — Next.js en exportación estática. Decisión de Adrián; el
  costo es más JS base que Astro, así que el rendimiento en móvil se vigila en cada bloque.
- **28/sep/2026** — Direct Upload en lugar de *Git integration*. El código vive en
  la cuenta de GitHub de YiSoft y la cuenta de Cloudflare es del cliente: ninguno
  depende del otro para operar, y el deploy solo ocurre con gates en verde.
- **28/sep/2026** — CSP con hashes calculados en el build. El export estático no
  admite nonces, y abrir `unsafe-inline` anularía el control.
- **28/sep/2026** — Fuente autoalojada con `next/font/local`. Evita una petición a
  Google Fonts, quita dos entradas de la CSP y mejora el LCP.
- **28/sep/2026** — GTM se descarga después de la carga, en tiempo ocioso. La
  medición no le cuesta rendimiento al visitante; el consentimiento por defecto se
  declara antes.
- **28/sep/2026** — Lighthouse audita un build de producción. En staging el sitio
  es no indexable y SEO siempre saldría en rojo; el build desplegado solo difiere
  en `robots`.
- **28/sep/2026** — Acciones de GitHub fijadas por SHA. Evita que una etiqueta
  movida ejecute código distinto en el pipeline; Dependabot las actualiza.
- **28/sep/2026** — `undici` forzado a ≥ 7.30 con `overrides`. Cierra un aviso
  moderado heredado de `wrangler`, que es una herramienta de desarrollo.

---

## Contacto

YiSoft Development · jesus-adrian@yisoft-development.com · 81 4984 6477
