/**
 * Catálogo de íconos de los sectores, tomados del prototipo. En las pestañas se
 * dibujan al entrar en pantalla; en el panel, cada vez que se muestra un sector.
 */

import { LineIcon, type LineShape } from "@/components/LineIcon/LineIcon";
import type { SectorIconName } from "@/types/content";

const ICONS: Readonly<Record<SectorIconName, readonly LineShape[]>> = {
  industrial: [
    { kind: "path", d: "M4 27V14l7 4.5V14l7 4.5V9l10 6v12z" },
    { kind: "path", d: "M11 27v-4h4v4" },
    { kind: "path", d: "M22 20h3" },
  ],
  corporate: [
    { kind: "path", d: "M6 28V6a2 2 0 012-2h10a2 2 0 012 2v22" },
    { kind: "path", d: "M20 13h5a2 2 0 012 2v13" },
    { kind: "path", d: "M3 28h26" },
    { kind: "path", d: "M10 9h2" },
    { kind: "path", d: "M16 9h2" },
    { kind: "path", d: "M10 14h2" },
    { kind: "path", d: "M16 14h2" },
    { kind: "path", d: "M10 19h2" },
    { kind: "path", d: "M16 19h2" },
  ],
  banking: [
    { kind: "path", d: "M3 12L16 4l13 8" },
    { kind: "path", d: "M5 12v13" },
    { kind: "path", d: "M27 12v13" },
    { kind: "path", d: "M11 15v8" },
    { kind: "path", d: "M16 15v8" },
    { kind: "path", d: "M21 15v8" },
    { kind: "path", d: "M3 28h26" },
  ],
  hospitality: [
    { kind: "path", d: "M5 28V8a2 2 0 012-2h18a2 2 0 012 2v20" },
    { kind: "path", d: "M3 28h26" },
    { kind: "path", d: "M10 11h3" },
    { kind: "path", d: "M19 11h3" },
    { kind: "path", d: "M10 16h3" },
    { kind: "path", d: "M19 16h3" },
    { kind: "path", d: "M13 28v-6h6v6" },
  ],
  health: [
    { kind: "rect", x: 5, y: 8, width: 22, height: 20, rx: 2 },
    { kind: "path", d: "M16 13v8" },
    { kind: "path", d: "M12 17h8" },
    { kind: "path", d: "M11 8V5a1 1 0 011-1h8a1 1 0 011 1v3" },
  ],
  retail: [
    { kind: "path", d: "M4 12h24l-2 16H6z" },
    { kind: "path", d: "M11 12V8a5 5 0 0110 0v4" },
    { kind: "path", d: "M4 12l2-5h20l2 5" },
  ],
  residential: [
    { kind: "path", d: "M4 14L16 4l12 10" },
    { kind: "path", d: "M7 12v16h18V12" },
    { kind: "path", d: "M13 28v-8h6v8" },
    { kind: "path", d: "M22 8V5h3v5" },
  ],
};

export interface SectorIconProps {
  readonly name: SectorIconName;
  readonly className?: string | undefined;
  readonly draw?: boolean;
}

export function SectorIcon({ name, className, draw = false }: SectorIconProps) {
  return <LineIcon shapes={ICONS[name]} className={className} draw={draw} />;
}
