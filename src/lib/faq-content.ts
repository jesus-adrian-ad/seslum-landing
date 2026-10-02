/**
 * Validación del contenido de Preguntas frecuentes durante el build estático.
 *
 * Exige al menos una pregunta, ids únicos y textos no vacíos: el id es la llave
 * de cada pregunta en el acordeón, y una pregunta o respuesta vacía se
 * publicaría tal cual en la página y en los datos estructurados FAQPage.
 */

import type { FaqContent } from "@/types/content";

export function parseFaqContent(raw: FaqContent): FaqContent {
  if (raw.items.length === 0) {
    throw new Error("Preguntas frecuentes necesita al menos una pregunta.");
  }
  const seen = new Set<string>();
  raw.items.forEach((item, index) => {
    if (seen.has(item.id)) {
      throw new Error(`El id de pregunta "${item.id}" está repetido.`);
    }
    seen.add(item.id);
    if (item.question.trim() === "" || item.answer.trim() === "") {
      throw new Error(`La pregunta en items[${index}] tiene la pregunta o la respuesta vacía.`);
    }
  });
  return raw;
}
