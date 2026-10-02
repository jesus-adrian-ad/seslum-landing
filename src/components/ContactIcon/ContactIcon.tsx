/**
 * Catálogo de íconos de las vías de contacto, redibujados del prototipo sobre la
 * rejilla de 32 × 32. WhatsApp se representa con un globo de conversación con
 * el auricular del ícono de llamada dentro, dibujado a trazo como el resto del
 * sitio; no se usa el logotipo de la marca.
 */

import { LineIcon, type LineShape } from "@/components/LineIcon/LineIcon";
import type { ContactChannelKind } from "@/types/content";

const ICONS: Readonly<Record<ContactChannelKind, readonly LineShape[]>> = {
  whatsapp: [
    { kind: "path", d: "M28 15.3a11.3 11.3 0 01-16.8 9.9L4 28l2.8-7.2A11.3 11.3 0 1128 15.3z" },
    { kind: "path", d: "M12.32 9.68h2.44L16 12.76l-1.56.92a7.36 7.36 0 003.68 3.68l.92-1.56 3.08 1.24v2.44a1.24 1.24 0 01-1.24 1.24 9.8 9.8 0 01-9.8-9.8 1.24 1.24 0 011.24-1.24z" },
  ],
  email: [
    { kind: "rect", x: 3, y: 7, width: 26, height: 18, rx: 2.5 },
    { kind: "path", d: "M3 9.5l13 8 13-8" },
  ],
  phone: [
    {
      kind: "path",
      d: "M6.7 4H12l2.7 6.7-3.4 2a16 16 0 008 8l2-3.4 6.7 2.7v5.3a2.7 2.7 0 01-2.7 2.7A21.3 21.3 0 014 6.7 2.7 2.7 0 016.7 4z",
    },
  ],
};

export interface ContactIconProps {
  readonly name: ContactChannelKind;
  readonly className?: string | undefined;
  readonly draw?: boolean;
  readonly strokeWidth?: number;
}

export function ContactIcon({ name, className, draw = false, strokeWidth }: ContactIconProps) {
  return (
    <LineIcon
      shapes={ICONS[name]}
      className={className}
      draw={draw}
      {...(strokeWidth === undefined ? {} : { strokeWidth })}
    />
  );
}
