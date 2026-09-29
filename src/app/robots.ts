/**
 * robots.txt generado en el build: indexable solo en producción.
 */

import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { isProduction } from "@/lib/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
