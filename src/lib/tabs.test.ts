import { describe, expect, it } from "vitest";
import { nextTabIndex } from "./tabs";

describe("nextTabIndex", () => {
  it("avanza con flecha derecha o abajo y da la vuelta al final", () => {
    expect(nextTabIndex("ArrowRight", 0, 7)).toBe(1);
    expect(nextTabIndex("ArrowDown", 6, 7)).toBe(0);
  });

  it("retrocede con flecha izquierda o arriba y da la vuelta al inicio", () => {
    expect(nextTabIndex("ArrowLeft", 3, 7)).toBe(2);
    expect(nextTabIndex("ArrowUp", 0, 7)).toBe(6);
  });

  it("lleva a los extremos con Inicio y Fin", () => {
    expect(nextTabIndex("Home", 4, 7)).toBe(0);
    expect(nextTabIndex("End", 1, 7)).toBe(6);
  });

  it("ignora otras teclas y listas vacías", () => {
    expect(nextTabIndex("Enter", 2, 7)).toBeNull();
    expect(nextTabIndex("ArrowRight", 0, 0)).toBeNull();
  });
});
