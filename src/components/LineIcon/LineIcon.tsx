/**
 * Ícono de línea sobre una rejilla de 32 × 32, compartido por los catálogos de
 * cada sección (ServiceIcon, SectorIcon).
 *
 * Cada trazo lleva pathLength="1" para dibujarse con stroke-dashoffset sin medir
 * su longitud real; los puntos rellenos se marcan con data-dot y entran con
 * escala. Un trazo por elemento: el patrón de guiones no se reparte de forma
 * consistente entre subtrazos de un mismo path. Con draw, el ícono queda marcado
 * con data-draw para que ScrollReveal lo dibuje al entrar en pantalla.
 */

export type LineShape =
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

function renderShape(shape: LineShape, key: number) {
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

export interface LineIconProps {
  readonly shapes: readonly LineShape[];
  readonly className?: string | undefined;
  readonly draw?: boolean;
}

export function LineIcon({ shapes, className, draw = false }: LineIconProps) {
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
      {...(draw ? { "data-draw": "" } : {})}
    >
      {shapes.map(renderShape)}
    </svg>
  );
}
