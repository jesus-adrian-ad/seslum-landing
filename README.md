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
| 0 | Fundaciones | `feature/foundations` | ✅ Publicado | #1 |
| 1 | Navbar | `feature/navbar` | ✅ Publicado | #2 |
| 2 | Encabezado | `feature/hero` | ✅ Publicado | — |
| 3 | Servicios | `feature/services` | ✅ Publicado | #10 |
| 4 | Sectores | `feature/sectors` | 🔨 En PR | — |
| 5 | Por qué SESLUM | `feature/why-seslum` | ⏳ Pendiente | — |
| 6 | Proyectos | `feature/projects` | ⏳ Pendiente | — |
| 7 | Marcas y aliados | `feature/brands` | ⏳ Pendiente | — |
| 8 | Preguntas frecuentes | `feature/faq` | ⏳ Pendiente | — |
| 9 | Contacto | `feature/contact` | ⏳ Pendiente | — |
| 10 | Formulario | `feature/contact-form` | ⏳ Pendiente | — |
| 11 | Pie de página | `feature/footer` | ⏳ Pendiente | — |
| 12 | Consentimiento | `feature/consent-banner` | ⏳ Pendiente | — |

**Siguiente bloque:** 5 · Por qué SESLUM

---

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router), exportación estática (`output: "export"`) |
| Lenguaje | TypeScript estricto |
| Estilos | CSS plano con design tokens |
| Animación | Entradas en CSS; GSAP + ScrollTrigger con carga diferida para el scroll (`src/lib/motion.ts`, `src/lib/use-motion.ts`) |
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
npm run images:strip # quita EXIF, XMP y C2PA de las imágenes (images:check solo verifica)
node scripts/optimize-image.mjs <original> <salida> <anchos> [--brand]  # variantes WebP de una foto
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
├── components/             # piezas reutilizables (ButtonLink, SectionHeading, ScrollReveal, LineIcon y sus catálogos ServiceIcon/SectorIcon, TagManager, StructuredData)
├── content/site.json       # datos del cliente: nombre, contacto, horario, SEO
├── fonts/                  # Source Sans 3 variable (OFL)
├── lib/                    # lógica pura y probada: medición, consentimiento, GTM, SEO, JSON-LD, entrada al scroll, teclado de pestañas, media queries, validación de contenido
├── sections/               # una por bloque, con su CSS Module al lado
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
- **Pendiente: vista previa al compartir el link (Open Graph).** Hoy WhatsApp,
  LinkedIn y demás muestran solo título y descripción. Se resuelve cuando llegue
  el logo SVG, en su propia rama (`fix/open-graph`):
  1. Imagen 1200×630 en JPG (< 300 KB) generada por script desde una plantilla,
     con `og:image`, dimensiones, `alt` y tarjeta `summary_large_image`.
  2. `metadataBase` por entorno: producción `seslum.com.mx`, staging la URL de su
     rama en `pages.dev` (hoy todo apunta al sitio de GoDaddy).
  3. `robots.txt` de staging que deje pasar a los lectores de vista previa;
     Google sigue fuera por el `noindex`.
  4. `Cross-Origin-Resource-Policy: cross-origin` solo para la imagen de vista previa.

### 1 · Navbar

- Barra fija casi opaca (sin `backdrop-filter`: ver Decisiones). Al pasar 48 px de scroll se compacta (68 → 56 px) y
  una línea de 2 px en el color de acento marca el avance de lectura.
- Logo placeholder con `srcset` (124/142 px y sus versiones 2x), respetando el
  ancho mínimo de 120 px del manual de marca. Enlaza a `#inicio`.
- Desde 1180 px: los 5 enlaces a las secciones y un indicador que se desliza bajo
  la sección visible (`aria-current="location"`). Verificado con Servicios: al
  llegar a `#servicios` el indicador se coloca bajo su enlace.
- Por debajo de 1180 px: menú a pantalla completa en un `<dialog>` modal. Foco
  atrapado, cierre con Esc y regreso del foco al botón. Se revela con un recorte
  hexagonal que nace del botón, con los enlaces entrando uno por uno.
- CTA "Solicitar cotización" con alto mínimo de 44 px; por debajo de 480 px dice
  "Cotizar" para caber en 320 px sin desbordar.
- Contenido en `src/content/sections/navbar.json`; componente reutilizable nuevo:
  `ButtonLink` (variantes `primary` y `outline`, texto corto opcional).
- Con `prefers-reduced-motion` no hay animaciones de entrada ni de menú; la línea
  de avance sigue al scroll porque la controla el visitante.

### 2 · Encabezado

- Foto de obra a sangre (`#inicio`) con el tratamiento del manual de marca: la
  desaturación (0.34) va horneada en la imagen y el tinte azul `#114E81` al 42 %
  es una capa plana en CSS; encima, un velo vertical en móvil y horizontal desde
  1024 px para que el texto siempre tenga contraste.
- Título "Proyectos que no admiten falla" con entrada palabra por palabra bajo
  máscara, subtítulo, CTA "Solicitar cotización" y "Ver proyectos" (variante
  `outline`, con las esquinas biseladas dibujadas completas).
- Panel "Líneas integradas": las luces de estado se encienden en secuencia, con
  un pulso suave y un barrido de escaneo al entrar.
- La entrada es CSS puro: se ve animada desde el primer pintado, sin esperar a
  JavaScript. El parallax al hacer scroll (la foto baja más lento y el contenido
  se desvanece) es GSAP con carga diferida.
- La foto es el LCP: se precarga con `fetchpriority="high"` y `srcset`
  (480/768/1000 px, WebP). Altura del bloque acotada entre 36 y 64 rem.
- Contenido en `src/content/sections/hero.json`. Original de la foto en
  `assets-src/foto-hero.jpg`; variantes con `node scripts/optimize-image.mjs
  assets-src/foto-hero.jpg public/images/hero/obra-contra-incendio 480,768,1000 --brand`.
- **Pendiente de insumo:** la foto de banco mide 1000×520. En pantallas grandes y
  en móvil vertical se ve suave; con una foto profesional de ≥ 2400 px de ancho
  se regeneran las variantes con el mismo comando, sin tocar código.

### 3 · Servicios

- `#servicios`: encabezado "Qué hacemos", tres tarjetas por especialidad
  (seguridad electrónica, protección contra incendios, infraestructura) y una
  franja con los dos servicios que aplican a todas las líneas: diez en total.
- Una columna en móvil y tres desde 900 px; la franja pasa a dos columnas desde
  768 px. Tarjetas con la esquina biselada y su borde completo (`.chamfer-frame`).
- Entrada al hacer scroll (`ScrollReveal`, reutilizable por las siguientes
  secciones): el encabezado y las tarjetas entran en cascada y el trazo de cada
  ícono se dibuja fila por fila. Es mejora progresiva: el HTML sale visible y solo
  se oculta para animarse lo que aún no está en pantalla cuando GSAP carga. Sin
  JavaScript o con movimiento reducido, la sección se ve completa.
- Al pasar el cursor por un servicio, su ícono se aclara y aparece una línea de
  acento en el borde de la tarjeta. Solo con puntero (`hover: hover`); las filas
  no son interactivas, así que no reciben foco.
- Encabezado de sección reutilizable (`SectionHeading`) e íconos de línea como
  componente (`ServiceIcon`), tomados del prototipo.
- Contenido en `src/content/sections/services.json`. Los íconos se validan en el
  build (`src/lib/services-content.ts`): un nombre mal capturado detiene la
  publicación con la ruta exacta del error.
- Textos aprobados por el cliente el 29/sep; la entrada se ajustó a su redacción.

### 4 · Sectores

- `#sectores` sobre el fondo alterno: encabezado "A quién servimos" y siete
  pestañas (Industrial, Corporativo, Bancario, Hotelero, Salud, Comercial,
  Residencial Plus) con su panel de detalle.
- Patrón WAI-ARIA Tabs: una sola parada de Tab en la lista, flechas en ambos
  ejes, Inicio y Fin, activación automática y `aria-orientation` según el ancho.
  Las pestañas no rotan solas.
- Los siete paneles están en el HTML estático (los buscadores leen todos); solo
  se muestra el activo.
- Móvil: tira horizontal deslizable con el panel justo debajo; la pestaña elegida
  se centra sola. Desde 900 px: lista vertical a la izquierda y panel a la derecha.
- Animación: el encabezado, la lista y el panel entran con `ScrollReveal` y los
  íconos de las pestañas se dibujan al entrar. Un indicador de acento se desliza
  hacia la pestaña activa, y al cambiar de sector el panel entra con un leve
  desplazamiento y su ícono se vuelve a dibujar. Todo con transiciones y
  animaciones CSS; con movimiento reducido el cambio es instantáneo.
- Íconos de línea unificados en `LineIcon`; cada sección conserva solo su
  catálogo (`ServiceIcon`, `SectorIcon`).
- Contenido en `src/content/sections/sectors.json`, validado en el build
  (`src/lib/sectors-content.ts`): íconos del catálogo, ids únicos y al menos un sector.
- Textos del prototipo, pendientes de aprobación de marketing.

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

**Tipografía:** Source Sans 3 variable, pesos 300 a 900. Tamaño mínimo de texto
14 px (`--fs-small`, `--fs-eyebrow`), por regla del método: el prototipo usaba
10.5–12.5 px en etiquetas y enlaces.
**Firma visual:** esquinas biseladas (`.chamfer-lg`, `.chamfer-md`, `.chamfer-sm`) y,
para tarjetas con borde, `.chamfer-frame` (dibuja también la línea del bisel).
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
| Código | Semgrep (`p/default`, `p/secrets` y reglas propias) + ESLint + tsc + Vitest + `images:check` | 0 hallazgos, 0 advertencias, imágenes sin metadatos |
| Cabeceras | Verificación de `public/_headers` | CSP sin `unsafe-*` |
| Web | Lighthouse CI (build de producción) | ≥ 90 en las 4 categorías (móvil) |
| Consola | `scripts/console-smoke.mjs` sobre `wrangler pages dev` | 0 errores, advertencias o violaciones de CSP |
| Accesibilidad | axe-core con Playwright (`scripts/axe-check.mjs`), 375 y 1440 px | 0 serious/critical |
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
| `legacy-javascript-insight` como advertencia en Lighthouse | Next.js mete siempre en su bundle principal un módulo de polyfills (`Array.prototype.at`, `flat`, `Object.fromEntries`, ~13 KB) que no se puede quitar por configuración. Es parte del costo de haber elegido Next; no afecta la calificación de Performance | 28/sep/2026 | Que Next permita desactivar `polyfill-module` para navegadores modernos |
| `@next/next/no-img-element` apagado | Con exportación estática, `next/image` no optimiza y además escribe `style="color:transparent"`, que la CSP bloquea. Las imágenes se entregan ya optimizadas (WebP, `srcset`, `width`/`height`) | 28/sep/2026 | Un loader de imágenes que no escriba estilos en línea |
| ESLint 9 en lugar de 10 | `eslint-plugin-react` (incluido en `eslint-config-next`) todavía no es compatible con ESLint 10 | 28/sep/2026 | Soporte de ESLint 10 en `eslint-plugin-react` |
| TypeScript 6 en lugar de 7 (Dependabot ignora sus versiones mayores) | `typescript-eslint` todavía no soporta TypeScript 7: el lint del CI falla con "does not support TS 7.0" | 29/sep/2026 | Soporte de TypeScript 7 en `typescript-eslint`; entonces se quita el `ignore` de `.github/dependabot.yml` |

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
- **28/sep/2026** — axe-core con Playwright en lugar de `@axe-core/cli`. La CLI
  necesita que ChromeDriver y Chrome tengan la misma versión, y en CI se rompió en
  cuanto el runner actualizó uno sin el otro. Playwright trae su propio navegador.
- **28/sep/2026** — GSAP 3 + ScrollTrigger como motor de animación (≈ 44 KB gz). Da control fino de timelines y scroll que CSS no cubre, y
  su licencia es gratuita para uso comercial. Todo movimiento pasa por
  `gsap.matchMedia` o por `prefers-reduced-motion`.
- **29/sep/2026** — GSAP con carga diferida (`src/lib/use-motion.ts`): se descarga
  después de `load` y en tiempo ocioso. En el JavaScript inicial competía con el
  primer pintado y subía el LCP simulado de 1.4 a 2.8 s. Las entradas de sección
  son CSS para no depender de él; se quitó `@gsap/react` (ya no hace falta).
- **29/sep/2026** — Sin `filter: saturate()` ni `backdrop-filter` en tiempo de
  ejecución. Rasterizar la foto completa con filtro retrasaba el primer pintado
  ~1 s en móvil; la desaturación se hornea en la imagen (`optimize-image.mjs
  --brand`) y el header y el panel usan fondos casi opacos.
- **29/sep/2026** — `sharp` como dependencia de desarrollo para el pipeline de
  imágenes (`scripts/optimize-image.mjs`): WebP en varios anchos, sin metadatos
  y sin ampliar nunca. Solo WebP: AVIF pesaba lo mismo en estas fotos.
- **29/sep/2026** — axe y el QA responsive auditan con movimiento reducido: miden
  el estado final, no un fotograma a mitad de una animación de entrada.
- **29/sep/2026** — Entrada al scroll como mejora progresiva (`ScrollReveal`).
  El contenido nunca depende de JavaScript para verse: GSAP solo oculta y anima lo
  que todavía está fuera de pantalla cuando termina de cargar, así nada parpadea.
  Oculta con `opacity` y no con `visibility`, para que un lector de pantalla siga
  encontrando ese contenido antes del scroll.
- **29/sep/2026** — Las filas de servicios no reciben foco de teclado. No son
  enlaces ni controles; hacerlas enfocables solo agregaría paradas vacías al
  recorrido con Tab. El efecto al pasar el cursor es decorativo.
- **29/sep/2026** — Sectores en móvil como tira horizontal deslizable (decisión
  de Adrián). Con las pestañas apiladas, el panel quedaba fuera de pantalla y el
  cambio de sector no se veía; la tira deja el panel justo debajo.
- **29/sep/2026** — El indicador de pestañas y el cambio de panel usan CSS, no
  GSAP. JavaScript solo escribe la posición del indicador como propiedades CSS
  (permitido por la CSP); así la interacción funciona aunque GSAP aún no cargue.
- **29/sep/2026** — El QA responsive ignora los desbordes dentro de cualquier
  contenedor con scroll o recorte propio, no solo en el padre directo. La tira de
  sectores se desliza a propósito; el scroll horizontal de la página se sigue
  verificando con `scrollWidth`.
- **28/sep/2026** — Imágenes sin metadatos (`scripts/strip-image-metadata.mjs`,
  gate `images:check` en CI). El puente de archivos del entorno de desarrollo
  añade un manifiesto C2PA de ~6 KB a cada imagen, y las fotos de obra pueden
  traer la ubicación GPS en su EXIF. Ninguna de las dos cosas debe publicarse.
- **28/sep/2026** — Menú móvil con `<dialog>` nativo: el navegador resuelve foco
  atrapado, Esc y fondo inerte, sin librería.
- **28/sep/2026** — Tamaño mínimo de texto de 14 px y alto táctil de 44 px, por
  encima del prototipo. Lo dicta el método; visualmente casi no cambia.
- **28/sep/2026** — Dependabot con `cooldown` de 7 días. Una versión recién
  publicada puede venir comprometida; esperar una semana deja que la comunidad la
  detecte antes de que llegue a este repo.
- **28/sep/2026** — `undici` forzado a ≥ 7.30 con `overrides`. Cierra un aviso
  moderado heredado de `wrangler`, que es una herramienta de desarrollo.

---

## Contacto

YiSoft Development · jesus-adrian@yisoft-development.com · 81 4984 6477
