/**
 * Íconos de línea de los servicios, trazados sobre una rejilla de 32 × 32.
 *
 * Cada trazo lleva pathLength="1" para que ScrollReveal pueda dibujarlo con
 * stroke-dashoffset sin medir su longitud real; los puntos rellenos se marcan
 * con data-dot y entran con escala. Un trazo por elemento: el patrón de guiones
 * no se reparte de forma consistente entre subtrazos de un mismo path.
 */

import type { ServiceIconName } from "@/types/content";

type Shape =
  | { readonly kind: "path"; readonly d: string }
  | { readonly kind: "circle"; readonly cx: number; readonly cy: number; readonly r: number; readonly dot?: true }
  | {
      readonly kind: "rect";
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx: number;
    };

const ICONS: Readonly<Record<ServiceIconName, readonly Shape[]>> = {
  cctv: [
    { kind: "path", d: "M4 9l19-4 2 7-19 4z" },
    { kind: "path", d: "M8 16v4a3 3 0 006 0v-2" },
    { kind: "circle", cx: 26, cy: 21, r: 4 },
    { kind: "path", d: "M26 19v2l1.5 1" },
  ],
  "access-control": [
    { kind: "rect", x: 5, y: 4, width: 14, height: 24, rx: 1.5 },
    { kind: "circle", cx: 15, cy: 16, r: 1.3, dot: true },
    { kind: "path", d: "M23 12v-2a4 4 0 018 0v2" },
    { kind: "rect", x: 23, y: 12, width: 8, height: 7, rx: 1.2 },
  ],
  intrusion: [
    { kind: "path", d: "M16 3l11 4v9c0 7-4.6 11.8-11 13.6C9.6 27.8 5 23 5 16V7z" },
    { kind: "path", d: "M11 16l3.5 3.5L21 13" },
  ],
  "fire-detection": [
    { kind: "circle", cx: 16, cy: 13, r: 6 },
    { kind: "circle", cx: 16, cy: 13, r: 2, dot: true },
    { kind: "path", d: "M6 23c2-1.5 6-2.5 10-2.5S24 21.5 26 23" },
    { kind: "path", d: "M9 28h14" },
  ],
  "fire-suppression": [
    { kind: "path", d: "M16 4c3 4 5.5 6.5 5.5 10.5A5.5 5.5 0 0116 20a5.5 5.5 0 01-5.5-5.5C10.5 10.5 13 8 16 4z" },
    { kind: "path", d: "M6 25h20" },
    { kind: "path", d: "M9 29h14" },
  ],
  "structured-cabling": [
    { kind: "rect", x: 4, y: 19, width: 24, height: 8, rx: 1.5 },
    { kind: "circle", cx: 9, cy: 23, r: 1.2, dot: true },
    { kind: "circle", cx: 14, cy: 23, r: 1.2, dot: true },
    { kind: "path", d: "M16 19V9" },
    { kind: "path", d: "M16 9a5 5 0 015-5" },
    { kind: "path", d: "M16 9a5 5 0 00-5-5" },
  ],
  electrical: [{ kind: "path", d: "M18 3L8 18h7l-1 11 10-15h-7z" }],
  "precision-cooling": [
    { kind: "rect", x: 4, y: 6, width: 24, height: 12, rx: 2 },
    { kind: "path", d: "M8 11h16" },
    { kind: "path", d: "M8 14.5h10" },
    { kind: "path", d: "M10 22c0 2-2 2-2 4" },
    { kind: "path", d: "M16 22c0 2-2 2-2 4" },
    { kind: "path", d: "M22 22c0 2-2 2-2 4" },
  ],
  engineering: [
    { kind: "path", d: "M16 3l11 6.5v13L16 29 5 22.5v-13z" },
    { kind: "circle", cx: 16, cy: 16, r: 3.5 },
    { kind: "path", d: "M16 5.5v7" },
    { kind: "path", d: "M16 19.5v7" },
    { kind: "path", d: "M8 11.5l5 3" },
    { kind: "path", d: "M24 11.5l-5 3" },
  ],
  maintenance: [
    { kind: "path", d: "M20.5 5a6.5 6.5 0 00-8.4 8.4L5 20.5 8.5 24l7.1-7.1A6.5 6.5 0 0024 8.5L20 12l-3-3z" },
    { kind: "circle", cx: 8, cy: 24, r: 1.3, dot: true },
  ],
};

function renderShape(shape: Shape, key: number) {
  switch (shape.kind) {
    case "path":
      return <path key={key} d={shape.d} pathLength={1} />;
    case "rect":
      return (
        <rect key={key} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} pathLength={1} />
      );
    case "circle":
      return shape.dot ? (
        <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} fill="currentColor" stroke="none" data-dot="" />
      ) : (
        <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} pathLength={1} />
      );
  }
}

export interface ServiceIconProps {
  readonly name: ServiceIconName;
  readonly className?: string | undefined;
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-draw=""
    >
      {ICONS[name].map(renderShape)}
    </svg>
  );
}
