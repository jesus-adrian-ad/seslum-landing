/**
 * robots.txt generado en el build.
 *
 * Producción es indexable. En staging, y mientras el sitio está en
 * construcción, nadie indexa, pero los lectores de vista
 * previa de mensajería y redes sí pueden leer la página: sin ellos, un link de
 * prueba compartido por WhatsApp o LinkedIn no muestra imagen ni título. Google
 * tampoco indexa staging aunque llegue, porque la página trae noindex.
 */

import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { buildEnv, isIndexable } from "@/lib/env";

export const dynamic = "force-static";

const LINK_PREVIEW_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "WhatsApp",
  "LinkedInBot",
  "Twitterbot",
  "Slackbot-LinkExpanding",
  "TelegramBot",
  "Discordbot",
];

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable(buildEnv)) {
    return {
      rules: [
        { userAgent: LINK_PREVIEW_AGENTS, allow: "/" },
        { userAgent: "*", disallow: "/" },
      ],
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
