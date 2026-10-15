import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { comingSoon } from "@/lib/content";
import { ComingSoon } from "./ComingSoon";

const markup = renderToStaticMarkup(<ComingSoon content={comingSoon} />);

describe("ComingSoon", () => {
  it("es el contenido principal al que apunta el enlace de saltar", () => {
    expect(markup).toContain('<main id="main"');
  });

  it("muestra el logo, un solo título y la línea de apoyo", () => {
    expect(markup).toContain(`src="${comingSoon.logo.src}"`);
    expect(markup).toContain(`alt="${comingSoon.logo.alt}"`);
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain(`>${comingSoon.title}</h1>`);
    expect(markup).toContain(`>${comingSoon.lead}</p>`);
  });

  it("no ofrece enlaces ni formularios", () => {
    expect(markup).not.toContain("<a ");
    expect(markup).not.toContain("<form");
  });
});
