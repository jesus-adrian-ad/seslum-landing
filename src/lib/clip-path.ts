/**
 * Geometría de los recortes con forma de hexágono, la firma visual de la marca.
 *
 * Funciones puras: calculan el polígono y el radio necesario para cubrir un área,
 * sin tocar el DOM. Las animaciones las usan para revelar paneles desde un punto.
 */

export function hexagonClipPath(centerX: number, centerY: number, radius: number): string {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return `${x.toFixed(2)}px ${y.toFixed(2)}px`;
  });
  return `polygon(${points.join(", ")})`;
}

export function coveringRadius(centerX: number, centerY: number, width: number, height: number): number {
  const farthestX = Math.max(centerX, width - centerX);
  const farthestY = Math.max(centerY, height - centerY);
  return Math.hypot(farthestX, farthestY) / Math.cos(Math.PI / 6);
}
