/**
 * Palomita y tacha de la tabla comparativa, sobre la misma rejilla de 32 × 32
 * que el resto de los íconos de línea. La palomita se dibuja al entrar en
 * pantalla; la tacha solo aparece, porque su papel es quedar en segundo plano.
 */

import { LineIcon, type LineShape } from "@/components/LineIcon/LineIcon";

export type ComparisonIconName = "check" | "cross";

const ICONS: Readonly<Record<ComparisonIconName, readonly LineShape[]>> = {
  check: [{ kind: "path", d: "M6 17l7 7L26 10" }],
  cross: [
    { kind: "path", d: "M8 8l16 16" },
    { kind: "path", d: "M24 8L8 24" },
  ],
};

const STROKE_WIDTH = 4;

export interface ComparisonIconProps {
  readonly name: ComparisonIconName;
  readonly className?: string | undefined;
}

export function ComparisonIcon({ name, className }: ComparisonIconProps) {
  return <LineIcon shapes={ICONS[name]} className={className} strokeWidth={STROKE_WIDTH} draw={name === "check"} />;
}
