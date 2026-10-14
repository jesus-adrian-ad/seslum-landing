import { describe, expect, it } from "vitest";
import {
  type AttributeTarget,
  DEFERRED_SRC_ATTR,
  DEFERRED_SRCSET_ATTR,
  promoteDeferredSources,
  shouldLoadDeferredMedia,
} from "./deferred-media";

class FakeElement implements AttributeTarget {
  readonly writes: string[] = [];
  private readonly attributes: Map<string, string>;

  constructor(initial: Record<string, string>) {
    this.attributes = new Map(Object.entries(initial));
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.writes.push(name);
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
}

describe("promoteDeferredSources", () => {
  it("pasa los valores diferidos a srcset y src, con srcset primero, y quita los data-*", () => {
    const image = new FakeElement({ [DEFERRED_SRC_ATTR]: "/a-1280.webp", [DEFERRED_SRCSET_ATTR]: "/a-768.webp 768w" });
    const source = new FakeElement({ [DEFERRED_SRCSET_ATTR]: "/a-480.webp 480w" });

    expect(promoteDeferredSources([source, image])).toBe(3);
    expect(image.writes).toEqual(["srcset", "src"]);
    expect(image.getAttribute("src")).toBe("/a-1280.webp");
    expect(image.getAttribute(DEFERRED_SRC_ATTR)).toBeNull();
    expect(source.getAttribute("srcset")).toBe("/a-480.webp 480w");
    expect(source.getAttribute(DEFERRED_SRCSET_ATTR)).toBeNull();
  });

  it("no toca los elementos ya cargados y es idempotente", () => {
    const loaded = new FakeElement({ src: "/b.webp" });
    expect(promoteDeferredSources([loaded])).toBe(0);
    expect(loaded.writes).toEqual([]);
    const pending = new FakeElement({ [DEFERRED_SRC_ATTR]: "/c.webp" });
    promoteDeferredSources([pending]);
    expect(promoteDeferredSources([pending])).toBe(0);
  });
});

describe("shouldLoadDeferredMedia", () => {
  it("solo carga cuando hay movimiento y no se pidió ahorro de datos", () => {
    expect(shouldLoadDeferredMedia({ reducedMotion: false, saveData: false })).toBe(true);
    expect(shouldLoadDeferredMedia({ reducedMotion: true, saveData: false })).toBe(false);
    expect(shouldLoadDeferredMedia({ reducedMotion: false, saveData: true })).toBe(false);
  });
});
