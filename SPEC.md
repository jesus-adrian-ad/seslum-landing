# SPEC — Landing Grupo SESLUM

> Estado: Bloque 3 (Servicios) · Última actualización: 29/sep/2026

Fuente de verdad técnica del proyecto. Cuando haya duda sobre qué construir, se
resuelve aquí. Lo marcado como `PENDIENTE` bloquea solo el bloque que lo usa.

## 1. Cliente

| Campo | Valor |
|---|---|
| Empresa / marca | Grupo SESLUM (el logo se aprobó como "SESLUM"; en textos se escribe "Grupo SESLUM") |
| Contratante | Juan Carlos Pastrana García, Director Comercial (contrato YS-CTR-2026-001) |
| Contacto de contenido | Danna (marketing) |
| Giro | Integrador de seguridad electrónica, protección contra incendios e infraestructura |
| Zona | Monterrey, N.L.; proyectos en el norte, noreste y centro del país |
| Idioma | Español (México) |
| Dominio | seslum.com.mx (GoDaddy; renovación 10/mar/2027) |
| Sitio actual | Websites + Marketing de GoDaddy (plan gratuito); se retira después del lanzamiento |

## 2. Objetivo

Que un responsable de instalaciones o compras de una empresa solicite cotización
a Grupo SESLUM.

- **CTA principal:** Solicitar cotización (formulario → `ventas@seslum.com.mx`).
- **CTA secundarias:** WhatsApp, llamada y correo, como vías equivalentes.
- **Éxito:** eventos `generate_lead`, `click_whatsapp`, `click_phone` y `click_email` en GA4.
- **Público:** industria, corporativo, banca, hotelería, salud, comercio y residencial de alta gama.
- **Qué NO es:** blog, CMS con publicación autónoma ni catálogo de productos
  (fuera de alcance; se cotizan aparte). La sección de noticias no se publica en el lanzamiento.

## 3. Mapa de secciones — los bloques

Orden de construcción. Una fila = una rama = un PR contra `develop`.

| # | Sección | Slug (rama) | Qué contiene | Estado |
|---|---|---|---|---|
| 0 | Fundaciones | `foundations` | Next.js estático, tokens, layout, SEO, GTM + Consent Mode, CSP, CI, deploy | Publicado |
| 1 | Navbar | `navbar` | Barra fija, logo, 5 enlaces (≥ 1180 px), CTA, menú hamburguesa animado (< 1180 px) | Publicado |
| 2 | Encabezado | `hero` | Foto de obra a pantalla completa, título, 2 CTA, panel "Líneas integradas" | Publicado |
| 3 | Servicios | `services` | 3 especialidades + 2 servicios transversales (10 capacidades) | En PR |
| 4 | Sectores | `sectors` | 7 sectores en pestañas accesibles, sin desplazar la página | Pendiente |
| 5 | Por qué SESLUM | `why-seslum` | Tabla comparativa integrador vs. proveedores separados | Pendiente |
| 6 | Proyectos | `projects` | Destacado + rejilla por sector, con y sin foto | Pendiente |
| 7 | Marcas y aliados | `brands` | Rejilla de logotipos autorizados | Pendiente |
| 8 | Preguntas frecuentes | `faq` | Acordeón de 8 preguntas + JSON-LD `FAQPage` | Pendiente |
| 9 | Contacto | `contact` | 3 vías (WhatsApp, correo, llamada) + botón flotante de WhatsApp | Pendiente |
| 10 | Formulario | `contact-form` | Formulario + Pages Function + Turnstile + honeypot + `generate_lead` | Pendiente |
| 11 | Pie de página | `footer` | 4 columnas, LinkedIn, crédito YiSoft, aviso de privacidad | Pendiente |
| 12 | Consentimiento | `consent-banner` | Banner de cookies con Consent Mode v2 (`update`) | Pendiente |

Estados: `Pendiente` → `En desarrollo` → `En PR` → `Publicado`.

Nota: el diseño está aprobado en el prototipo (Anexo A). Por decisión de Adrián,
no se generan las 3 previews por sección; las animaciones se definen en el prompt
de cada bloque.

## 4. Contenido

| Elemento | Origen | ¿Recibido? |
|---|---|---|
| Textos definitivos | Danna, a partir del guion de YiSoft | ✅ Encabezado aprobado tal cual · ⏳ resto con los del prototipo |
| Logo SVG | Equipo de diseño de SESLUM | ⏳ Placeholder PNG mientras tanto |
| Fotografías | Banco de imágenes (hero, cuarto de bombas, proyecto) | ✅ Foto del hero aprobada por el cliente (mide 1000×520; conviene una de ≥ 2400 px) |
| Logotipos de marcas autorizadas | Cliente | ✅ |
| Datos de contacto y horario | Cliente | ✅ (`src/content/site.json`) |
| Aviso de privacidad | Cliente | ⏳ **Bloquea el bloque `contact-form`** |
| Perfil de LinkedIn | Cliente | ⏳ Se enlaza cuando exista |
| Imagen Open Graph (1200×630) | Se arma con el logo definitivo | ⏳ Bloqueada por el logo SVG (ver sección 11) |

## 5. Sistema visual

| Token | Valor | Uso |
|---|---|---|
| `--color-navy` | `#142036` | Fondo principal |
| `--color-void` | `#0B1120` | Secciones alternas |
| `--color-raised` | `#1A2942` | Tarjetas |
| `--color-deep` | `#114E81` | Tinte de fotos |
| `--color-mid` | `#0D71B2` | Botones sobre fondo claro |
| `--color-signal` | `#23B5E9` | Acento y CTA sobre oscuro. **No usar sobre blanco (no cumple AA).** |
| `--color-paper` | `#F0F1FA` | Texto principal |

- **Tipografía:** Source Sans 3 variable (300–900), autoalojada, subconjunto latino.
- **Modo:** solo oscuro.
- **Firma visual:** esquinas biseladas con `clip-path` (14 / 12 / 10 px).
- **Movimiento:** GSAP, respetando `prefers-reduced-motion`.

## 6. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 16 (App Router) con `output: "export"` | Decisión de Adrián; HTML estático completo para SEO |
| Lenguaje | TypeScript estricto | Contratos de contenido verificados en compilación |
| Estilos | CSS plano con tokens + una hoja por sección | Sin runtime de estilos; compatible con CSP estricta |
| Animación | Entradas en CSS; GSAP + ScrollTrigger con carga diferida para scroll e interacción | Animaciones de primer nivel sin castigar el LCP |
| Formularios | Cloudflare Pages Function | El export estático no admite rutas de API |
| Analítica | GTM → GA4 (y Google Ads desde GTM) | GTM es la única etiqueta en el código |
| Pruebas | Vitest para `src/lib` | La lógica pura es lo que vale la pena probar |
| Gestor de paquetes | npm | Lockfile commiteado |

## 7. Despliegue

| Campo | Valor |
|---|---|
| Plataforma | Cloudflare Pages, **Direct Upload** desde GitHub Actions (`wrangler pages deploy`) |
| Cuenta | Grupo SESLUM (dueño: `sitioweb@seslum.com.mx`); Adrián como Administrator |
| Repo | GitHub, cuenta de Adrián. Entrega del código al cliente en ZIP |
| Rama de producción | `main` |
| Rama de staging | `develop` |
| Preview por PR | Sí; el workflow comenta la URL en el PR |
| Dominio productivo | seslum.com.mx |
| DNS | Migración a Cloudflare (opción A) antes del lanzamiento |
| Rollback | Revertir el merge en `main`, o promover un deployment anterior desde el panel de Pages |

Secrets del repo: `CLOUDFLARE_API_TOKEN` (solo Pages · Edit), `CLOUDFLARE_ACCOUNT_ID`.
Variables del repo: `CF_PAGES_PROJECT`, `GTM_ID`.

## 8. Seguridad

| Control | Decisión |
|---|---|
| CSP | Estricta, sin `unsafe-inline`. Scripts en línea de Next autorizados por hash en cada build (`scripts/csp-hashes.mjs`) |
| Estilos en línea | Prohibidos; el build falla si aparecen |
| Terceros permitidos | Google Tag Manager, Google Analytics 4 y Google Ads (conversiones) |
| Anti-bots | Turnstile + honeypot + rate limit (bloque `contact-form`) |
| WAF | Reglas gestionadas de Cloudflare + Bot Fight Mode (release) |
| Datos personales | Nombre, empresa, correo, teléfono, servicio de interés y mensaje |
| Destino | `ventas@seslum.com.mx`, sin copia; remitente autenticado del servicio de envío con `reply-to` al visitante (SPF `-all`, DMARC `p=reject`) |
| Retención | El sitio no almacena envíos |

## 9. Medición

| Cuenta | Propietario | Estado |
|---|---|---|
| Google Tag Manager | Cuenta de Google de SESLUM (marketing) | ⏳ Pendiente de crear |
| GA4 | Cuenta de Google de SESLUM | ⏳ Se configura desde GTM |
| Search Console | Cuenta de Google de SESLUM, verificación por TXT en DNS | ⏳ Tras migrar DNS |
| Acceso de YiSoft | `jesus-adrian@yisoft-development.com`, permiso Publicar | ⏳ |

Eventos: `generate_lead` (evento clave), `click_whatsapp`, `click_phone`,
`click_email`, con el parámetro `source` (`header`, `hero`, `contact`, `footer`,
`floating`, `form`).

Consent Mode v2: todo denegado por defecto salvo `functionality_storage` y
`security_storage`; el banner (bloque 12) actualiza el estado.

## 10. Criterios de aceptación

- Lighthouse ≥ 90 en las cuatro categorías (móvil).
- 0 violaciones `serious`/`critical` de axe-core.
- 0 vulnerabilidades `high`/`critical`.
- Consola limpia y CSP activa sirviendo con las cabeceras reales.
- Sin scroll horizontal en 320, 375, 425, 768, 1024, 1440 y 2560 px.
- Formulario entrega y resiste envíos automatizados.
- `README.md` refleja el estado real.

## 11. PENDIENTE

- [ ] ID del contenedor de GTM y acceso para YiSoft (marketing de SESLUM).
- [ ] Logo en SVG (equipo de diseño).
- [ ] Primer bloque de textos (Danna).
- [ ] Aviso de privacidad (cliente) — bloquea `contact-form`.
- [ ] Servicio de envío de correo del formulario — se decide en `contact-form`.
- [x] Tamaños de texto: se sigue la regla del método (≥ 14 px, tap targets ≥ 44 px) por encima del prototipo. Decidido por Adrián el 28/sep.
- [ ] Mensaje precargado de WhatsApp (Danna).
- [ ] Perfil de LinkedIn.
- [ ] Vista previa al compartir (Open Graph) — espera el logo SVG. Rama propia
      `fix/open-graph`: imagen 1200×630 JPG < 300 KB por script, `og:image` con
      dimensiones y `alt`, tarjeta `summary_large_image`, `metadataBase` por
      entorno (staging hoy apunta a GoDaddy), `robots.txt` de staging abierto a
      los lectores de vista previa y `Cross-Origin-Resource-Policy: cross-origin`
      solo para esa imagen. Detectado el 29/sep al compartir el link.
- [ ] Foto del encabezado en alta resolución (≥ 2400 px de ancho). Se regenera con `scripts/optimize-image.mjs … --brand`.
