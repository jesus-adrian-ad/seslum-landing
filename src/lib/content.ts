/**
 * Punto único de acceso tipado al contenido del cliente.
 *
 * Las secciones y el layout leen de aquí, nunca del JSON directo, para que el
 * compilador verifique que el contenido cumple su contrato.
 */

import heroJson from "@/content/sections/hero.json";
import navbarJson from "@/content/sections/navbar.json";
import sectorsJson from "@/content/sections/sectors.json";
import servicesJson from "@/content/sections/services.json";
import whySeslumJson from "@/content/sections/why-seslum.json";
import siteJson from "@/content/site.json";
import { parseSectorsContent } from "@/lib/sectors-content";
import { parseServicesContent } from "@/lib/services-content";
import type {
  HeroContent,
  NavbarContent,
  SectorsContent,
  ServicesContent,
  SiteContent,
  WhySeslumContent,
} from "@/types/content";

export const site: SiteContent = siteJson;

export const navbar: NavbarContent = navbarJson;

export const hero: HeroContent = heroJson;

export const services: ServicesContent = parseServicesContent(servicesJson);

export const sectors: SectorsContent = parseSectorsContent(sectorsJson);

export const whySeslum: WhySeslumContent = whySeslumJson;
