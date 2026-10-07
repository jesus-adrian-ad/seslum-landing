import { describe, expect, it } from "vitest";
import { contactForm } from "@/lib/content";
import { failureStatus, fieldErrorMessage, statusMessage } from "./contact-form-messages";

describe("fieldErrorMessage", () => {
  it("usa el mensaje propio del campo cuando existe", () => {
    expect(fieldErrorMessage(contactForm, "email", "invalid")).toBe(contactForm.fieldErrors.email?.invalid);
  });

  it("cae al mensaje genérico del código", () => {
    expect(fieldErrorMessage(contactForm, "company", "tooLong")).toBe(contactForm.errors.tooLong);
  });
});

describe("statusMessage", () => {
  it("solo muestra texto en los estados de aviso", () => {
    expect(statusMessage(contactForm, "captcha")).toBe(contactForm.status.captcha);
    expect(statusMessage(contactForm, "idle")).toBe("");
    expect(statusMessage(contactForm, "sending")).toBe("");
  });
});

describe("failureStatus", () => {
  it("respeta los códigos conocidos y trata lo demás como error de servidor", () => {
    expect(failureStatus("captcha")).toBe("captcha");
    expect(failureStatus("invalid")).toBe("invalid");
    expect(failureStatus("otro")).toBe("server");
    expect(failureStatus(undefined)).toBe("server");
  });
});
