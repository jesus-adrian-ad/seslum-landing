import { describe, expect, it } from "vitest";
import { services } from "@/lib/content";
import { copyrightLine, footerServiceLinks } from "./footer-content";

describe("footerServiceLinks", () => {
  const links = footerServiceLinks(services);

  it("lista las líneas de las especialidades, sin los servicios transversales", () => {
    expect(links.map((link) => link.label)).toEqual(services.groups.flatMap((group) => group.items.map((i) => i.name)));
    const transversal = services.transversal.items.map((item) => item.name);
    expect(links.some((link) => transversal.includes(link.label))).toBe(false);
  });

  it("todas llevan a la sección de Servicios", () => {
    expect(new Set(links.map((link) => link.href))).toEqual(new Set([`#${services.id}`]));
  });
});

describe("copyrightLine", () => {
  it("arma el aviso de derechos con el año recibido", () => {
    expect(copyrightLine(2026, "Grupo SESLUM", "Todos los derechos reservados.")).toBe(
      "© 2026 Grupo SESLUM. Todos los derechos reservados.",
    );
  });
});
