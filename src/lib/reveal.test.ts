import { describe, expect, it } from "vitest";
import { isBelowViewport, pendingReveals } from "./reveal";

describe("isBelowViewport", () => {
  it("considera pendiente lo que empieza en el borde inferior o más abajo", () => {
    expect(isBelowViewport(800, 800)).toBe(true);
    expect(isBelowViewport(1200, 800)).toBe(true);
  });

  it("deja en paz lo que ya asoma en pantalla", () => {
    expect(isBelowViewport(799, 800)).toBe(false);
    expect(isBelowViewport(-300, 800)).toBe(false);
  });
});

describe("pendingReveals", () => {
  it("filtra solo los elementos que aún no se ven, en su orden", () => {
    const tops = [{ top: 100 }, { top: 900 }, { top: 640 }, { top: 1500 }];
    expect(pendingReveals(tops, (item) => item.top, 800)).toEqual([{ top: 900 }, { top: 1500 }]);
  });
});
