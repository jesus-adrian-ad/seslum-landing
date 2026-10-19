/**
 * Instalación de Google Tag Manager con los fragmentos oficiales de Google.
 *
 * El fragmento del `<head>` y el `<noscript>` son los mismos que entrega GTM al
 * instalar un contenedor; solo cambia el ID. En el `<noscript>`, el `style` en
 * línea de Google se sustituye por `hidden`, porque la CSP no permite estilos en
 * línea. El ID se valida contra un patrón de letras, dígitos y guion antes de
 * insertarlo, así un valor mal formado no puede inyectar código ni HTML. El
 * consentimiento por defecto debe declararse antes de este fragmento (ver
 * consent-bootstrap.ts).
 *
 * El fragmento se ejecuta sin cambiarle una letra cuando la página terminó de
 * cargar y el hilo principal está libre (evento `load` y después
 * `requestIdleCallback`, con 3 s de tope). Solo con `load` no alcanzaba: la
 * página dispara `load` antes de pintar la foto del encabezado, `gtm.js` empezaba
 * antes del LCP y Lighthouse lo contaba dentro de él (LCP móvil arriba de 2.5 s).
 */

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
const GTM_ORIGIN = "https://www.googletagmanager.com";

export function isValidGtmId(id: string): boolean {
  return GTM_ID_PATTERN.test(id);
}

function assertValidGtmId(id: string): void {
  if (!isValidGtmId(id)) {
    throw new Error(`ID de contenedor de GTM inválido: ${JSON.stringify(id)}`);
  }
}

export function buildGtmHeadSnippet(id: string): string {
  assertValidGtmId(id);
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'${GTM_ORIGIN}/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;
}

export const GTM_IDLE_TIMEOUT_MS = 3000;

export function buildGtmDeferredScript(id: string): string {
  return `window.addEventListener("load",function(){var r=window.requestIdleCallback||function(f){window.setTimeout(f,1);};r(function(){${buildGtmHeadSnippet(id)}},{timeout:${GTM_IDLE_TIMEOUT_MS}});},{once:true});`;
}

export function buildGtmNoscriptHtml(id: string): string {
  assertValidGtmId(id);
  return `<noscript><iframe src="${GTM_ORIGIN}/ns.html?id=${id}" title="Google Tag Manager" height="0" width="0" hidden></iframe></noscript>`;
}
