/**
 * Utilidades del aviso de privacidad: fecha de actualización legible y
 * división del texto para enlazar los correos que aparecen en él.
 */

const DATE_FORMAT = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" });
const EMAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

export type TextPart = { readonly kind: "text"; readonly value: string } | { readonly kind: "email"; readonly value: string };

export function formatUpdated(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`privacy.json: fecha de actualización inválida (${isoDate}).`);
  }
  return DATE_FORMAT.format(date);
}

export function splitEmails(text: string): readonly TextPart[] {
  return text
    .split(EMAIL)
    .filter((part) => part !== "")
    .map((part) => (EMAIL.test(part) ? { kind: "email", value: part } : { kind: "text", value: part }));
}
