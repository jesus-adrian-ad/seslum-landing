/**
 * Publica un bloque JSON-LD en el documento.
 *
 * El contenido ya viene serializado y escapado por serializeJsonLd, así que no
 * puede cerrar la etiqueta ni inyectar marcado. Es un bloque de datos: el
 * navegador no lo ejecuta y la CSP no lo trata como script.
 */

import { type JsonLdObject, serializeJsonLd } from "@/lib/structured-data";

export interface StructuredDataProps {
  readonly data: JsonLdObject;
}

export function StructuredData({ data }: StructuredDataProps) {
  return <script type="application/ld+json">{serializeJsonLd(data)}</script>;
}
