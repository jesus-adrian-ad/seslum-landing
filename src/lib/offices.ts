/**
 * Ciudades con atención local de Grupo SESLUM, en los dos formatos que usa la
 * página: en línea con separadores para el pie y como enumeración en español
 * ("A, B, C y D") para la frase de Contacto. La lista vive en site.json.
 */

const OFFICE_SEPARATOR = " · ";
const SPANISH_LIST = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

export function officesInline(offices: readonly string[]): string {
  return offices.join(OFFICE_SEPARATOR);
}

export function officesSentence(offices: readonly string[]): string {
  return SPANISH_LIST.format(offices);
}

export function assertOffices(offices: readonly string[]): void {
  if (offices.length === 0) {
    throw new Error("site.json: location.offices necesita al menos una ciudad.");
  }
  const blank = offices.find((office) => office.trim() === "");
  if (blank !== undefined) {
    throw new Error("site.json: location.offices tiene una ciudad vacía.");
  }
  if (new Set(offices).size !== offices.length) {
    throw new Error("site.json: location.offices tiene ciudades repetidas.");
  }
}
