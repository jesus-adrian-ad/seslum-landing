/**
 * sitemap.xml generado en el build con la URL productiva: la página principal
 * y el aviso de privacidad.
 */

import type { MetadataRoute } from "next";
import { privacy, site } from "@/lib/content";
import { PRIVACY_PATH } from "@/lib/privacy";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}${PRIVACY_PATH}`,
      lastModified: new Date(`${privacy.updated}T00:00:00Z`),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
