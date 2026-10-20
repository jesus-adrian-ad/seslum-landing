import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { contactForm } from "@/lib/content";
import { SuccessDialog } from "./SuccessDialog";

const { success } = contactForm;
const markup = renderToStaticMarkup(
  <SuccessDialog open={false} title={success.title} body={success.body} closeLabel={success.close} onClose={() => {}} />,
);

describe("SuccessDialog", () => {
  it("es un dialog nativo cerrado hasta que el envío se confirma", () => {
    expect(markup).toMatch(/^<dialog /);
    expect(markup).not.toContain(" open");
  });

  it("anuncia el título y el mensaje con los que se etiqueta el dialog", () => {
    const labelledBy = markup.match(/aria-labelledby="([^"]+)"/)?.[1];
    const describedBy = markup.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(markup).toContain(`<h2 id="${labelledBy}"`);
    expect(markup).toContain(`>${success.title}</h2>`);
    expect(markup).toContain(`<p id="${describedBy}"`);
    expect(markup).toContain(`>${success.body}</p>`);
  });

  it("dibuja el círculo y la palomita con trazos de longitud normalizada", () => {
    expect(markup.match(/pathLength="1"/g)).toHaveLength(2);
  });

  it("ofrece cerrar con el botón principal y con la equis etiquetada", () => {
    expect(markup).toContain(`>${success.close}</button>`);
    expect(markup).toContain(`aria-label="${success.close}"`);
  });
});
