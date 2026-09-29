/**
 * Punto único de acceso tipado al contenido del cliente.
 *
 * Las secciones y el layout leen de aquí, nunca del JSON directo, para que el
 * compilador verifique que el contenido cumple su contrato.
 */

import heroJson from "@/content/sections/hero.json";
import navbarJson from "@/content/sections/navbar.json";
import servicesJson from "@/content/sections/services.json";
import siteJson from "@/content/site.json";
import { parseServicesContent } from "@/lib/services-content";
import type { HeroContent, NavbarContent, ServicesContent, SiteContent } from "@/types/content";

export const site: SiteContent = siteJson;

export const navbar: NavbarContent = navbarJson;

export const hero: HeroContent = heroJson;

export const services: ServicesContent = parseServicesContent(servicesJson);
