import { describe, expect, it } from "vitest";
import { coveringRadius, hexagonClipPath } from "@/lib/clip-path";

describe("hexagonClipPath", () => {
  it("builds a six-point polygon centered on the given point", () => {
    const polygon = hexagonClipPath(100, 50, 10);
    const points = polygon.replace(/^polygon\(|\)$/g, "").split(", ");
    expect(points).toHaveLength(6);
    for (const point of points) {
      const [x, y] = point.split(" ").map((value) => Number.parseFloat(value));
      expect(Math.hypot((x ?? 0) - 100, (y ?? 0) - 50)).toBeCloseTo(10, 1);
    }
  });

  it("collapses to the center when the radius is zero", () => {
    expect(hexagonClipPath(20, 30, 0)).toBe(
      "polygon(20.00px 30.00px, 20.00px 30.00px, 20.00px 30.00px, 20.00px 30.00px, 20.00px 30.00px, 20.00px 30.00px)",
    );
  });
});

describe("coveringRadius", () => {
  it("reaches the farthest corner even at the hexagon's narrowest point", () => {
    const radius = coveringRadius(350, 30, 375, 812);
    const farthestCorner = Math.hypot(350, 812 - 30);
    expect(radius * Math.cos(Math.PI / 6)).toBeCloseTo(farthestCorner, 5);
  });
});
