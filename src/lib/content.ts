/**
 * Punto único de acceso tipado al contenido del cliente.
 *
 * Las secciones y el layout leen de aquí, nunca del JSON directo, para que el
 * compilador verifique que el contenido cumple su contrato.
 */

import siteJson from "@/content/site.json";
import type { SiteContent } from "@/types/content";

export const site: SiteContent = siteJson;
