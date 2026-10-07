import { describe, expect, it } from "vitest";
import type { ContactSubmission } from "@/lib/contact-form";
import { buildContactEmail, buildSubject, escapeHtml } from "./contact-email";

const data: ContactSubmission = {
  name: "Ana López",
  company: "",
  email: "ana@industrias.mx",
  phone: "",
  service: "Control de acceso",
  message: "Hola <script>alert(1)</script>\nSegunda línea",
};

const addresses = { from: "Sitio <formulario@mail.seslum.com.mx>", to: "ventas@seslum.com.mx" };

describe("escapeHtml", () => {
  it("escapa los cinco caracteres especiales", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("buildSubject", () => {
  it("incluye la empresa solo si la hay", () => {
    expect(buildSubject(data)).toBe("Solicitud de cotización: Ana López");
    expect(buildSubject({ ...data, company: "Industrias" })).toBe("Solicitud de cotización: Ana López (Industrias)");
  });
});

describe("buildContactEmail", () => {
  const email = buildContactEmail(data, addresses);

  it("envía desde el subdominio autenticado a ventas, con respuesta al visitante", () => {
    expect(email.from).toBe(addresses.from);
    expect(email.to).toEqual(["ventas@seslum.com.mx"]);
    expect(email.reply_to).toBe("ana@industrias.mx");
  });

  it("marca los campos opcionales vacíos", () => {
    expect(email.text).toContain("Empresa: No lo indicó");
    expect(email.text).toContain("Servicio de interés: Control de acceso");
  });

  it("escapa el mensaje en el HTML y conserva los saltos de línea", () => {
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;<br>Segunda línea");
    expect(email.text).toContain("<script>alert(1)</script>\nSegunda línea");
  });
});
