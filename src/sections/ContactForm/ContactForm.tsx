"use client";

/**
 * Formulario de cotización (bloque 10): datos del visitante, verificación con
 * Turnstile y envío a la Pages Function /api/contact, que manda el correo a
 * ventas por Resend.
 *
 * Valida con las mismas reglas que el servidor (src/lib/contact-form.ts) y
 * muestra el error bajo cada campo, ligado con aria-describedby; al fallar
 * mueve el foco al primer campo con error. Turnstile se carga cuando el
 * formulario se acerca a la vista y en modo "interaction-only": solo se ve si
 * Cloudflare necesita preguntarle algo al visitante. Cada token sirve una vez,
 * así que el widget se reinicia después de cada intento. Con el envío exitoso
 * publica generate_lead con source "form" y el servicio elegido.
 *
 * El honeypot es un campo invisible que una persona no ve ni alcanza con el
 * teclado, pero que sí viaja en el formulario; si llega lleno, el servidor descarta el envío en silencio.
 */

import { type ChangeEvent, type FormEvent, useEffect, useId, useRef, useState } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import {
  CONTACT_ENDPOINT,
  type ContactField,
  type ContactResponse,
  type ContactSubmission,
  emptySubmission,
  FIELD_RULES,
  type FieldErrors,
  firstInvalidField,
  HONEYPOT_FIELD,
  TURNSTILE_ACTION,
  TURNSTILE_RESPONSE_FIELD,
  validateSubmission,
} from "@/lib/contact-form";
import { type FormStatus, failureStatus, fieldErrorMessage, statusMessage } from "@/lib/contact-form-messages";
import { PRIVACY_PATH } from "@/lib/privacy";
import { loadTurnstile, type TurnstileApi } from "@/lib/turnstile-client";
import type { ContactFormContent } from "@/types/content";
import styles from "./ContactForm.module.css";

const LOAD_MARGIN = "600px 0px";
const NO_SERVICE = "sin_especificar";

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export interface ContactFormProps {
  readonly content: ContactFormContent;
  readonly services: readonly string[];
  readonly turnstileSiteKey: string;
}

export function ContactForm({ content, services, turnstileSiteKey }: ContactFormProps) {
  const [values, setValues] = useState<ContactSubmission>(emptySubmission);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [token, setToken] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const turnstileRef = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, FieldElement | null>>>({});
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const statusId = `${baseId}-status`;
  const succeeded = status === "success";
  const fieldId = (field: ContactField): string => `${baseId}-${field}`;
  const errorId = (field: ContactField): string => `${baseId}-${field}-error`;

  useEffect(() => {
    const container = widgetRef.current;
    const form = formRef.current;
    if (!container || !form || succeeded) {
      return undefined;
    }
    let cancelled = false;
    const mount = (): void => {
      loadTurnstile()
        .then((api) => {
          if (cancelled || turnstileRef.current) {
            return;
          }
          const id = api.render(container, {
            sitekey: turnstileSiteKey,
            action: TURNSTILE_ACTION,
            theme: "dark",
            size: "flexible",
            appearance: "interaction-only",
            language: "es",
            callback: setToken,
            "expired-callback": () => setToken(null),
            "error-callback": () => setToken(null),
          });
          if (id) {
            turnstileRef.current = { api, id };
          }
        })
        .catch(() => {
          if (!cancelled) {
            setStatus("captcha");
          }
        });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          mount();
        }
      },
      { rootMargin: LOAD_MARGIN },
    );
    observer.observe(form);
    return () => {
      cancelled = true;
      observer.disconnect();
      const widget = turnstileRef.current;
      turnstileRef.current = null;
      widget?.api.remove(widget.id);
    };
  }, [succeeded, turnstileSiteKey]);

  useEffect(() => {
    if (succeeded) {
      successRef.current?.focus();
    }
  }, [succeeded]);

  const resetTurnstile = (): void => {
    setToken(null);
    const widget = turnstileRef.current;
    widget?.api.reset(widget.id);
  };

  const handleChange = (field: ContactField) => (event: ChangeEvent<FieldElement>): void => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (errors[field]) {
      const result = validateSubmission(next, services);
      const fieldError = result.ok ? undefined : result.errors[field];
      setErrors((current) => ({ ...current, [field]: fieldError }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === "sending") {
      return;
    }
    const result = validateSubmission(values, services);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("invalid");
      const first = firstInvalidField(result.errors);
      if (first) {
        fieldRefs.current[first]?.focus();
      }
      return;
    }
    setErrors({});
    if (!token) {
      setStatus("verifying");
      return;
    }
    setStatus("sending");
    const honeypot = new FormData(event.currentTarget).get(HONEYPOT_FIELD);
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          [HONEYPOT_FIELD]: typeof honeypot === "string" ? honeypot : "",
          [TURNSTILE_RESPONSE_FIELD]: token,
        }),
      });
      const body = (await response.json()) as ContactResponse;
      if (body.ok) {
        trackEvent(ANALYTICS_EVENTS.lead, { source: "form", service: result.data.service || NO_SERVICE });
        setValues(emptySubmission());
        setStatus("success");
        return;
      }
      setStatus(failureStatus(body.error));
    } catch {
      setStatus("server");
    }
    resetTurnstile();
  };

  const registerField = (field: ContactField) => (element: FieldElement | null): void => {
    fieldRefs.current[field] = element;
  };

  const fieldProps = (field: ContactField) => {
    const error = errors[field];
    return {
      id: fieldId(field),
      name: field,
      value: values[field],
      onChange: handleChange(field),
      ref: registerField(field),
      required: FIELD_RULES[field].required,
      maxLength: FIELD_RULES[field].max,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId(field) : undefined,
      className: styles.control,
    } as const;
  };

  const renderLabel = (field: ContactField) => (
    <label className={styles.label} htmlFor={fieldId(field)}>
      {content.labels[field]}
      {FIELD_RULES[field].required ? null : <span className={styles.optional}> {content.optional}</span>}
    </label>
  );

  const renderError = (field: ContactField) => {
    const code = errors[field];
    return code ? (
      <p className={styles.error} id={errorId(field)}>
        {fieldErrorMessage(content, field, code)}
      </p>
    ) : null;
  };

  if (succeeded) {
    return (
      <div id={content.id} className={`chamfer-frame ${styles.card} ${styles.success}`} role="status">
        <h3 className={styles.title} ref={successRef} tabIndex={-1}>
          {content.success.title}
        </h3>
        <p className={styles.successBody}>{content.success.body}</p>
        <button type="button" className={styles.again} onClick={() => setStatus("idle")}>
          {content.success.again}
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      id={content.id}
      ref={formRef}
      className={`chamfer-frame ${styles.card}`}
      aria-labelledby={titleId}
      noValidate
      onSubmit={handleSubmit}
    >
      <h3 id={titleId} className={styles.title}>
        {content.title}
      </h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          {renderLabel("name")}
          <input type="text" autoComplete="name" {...fieldProps("name")} />
          {renderError("name")}
        </div>
        <div className={styles.field}>
          {renderLabel("company")}
          <input type="text" autoComplete="organization" {...fieldProps("company")} />
          {renderError("company")}
        </div>
        <div className={styles.field}>
          {renderLabel("email")}
          <input type="email" autoComplete="email" inputMode="email" spellCheck={false} {...fieldProps("email")} />
          {renderError("email")}
        </div>
        <div className={styles.field}>
          {renderLabel("phone")}
          <input type="tel" autoComplete="tel" inputMode="tel" {...fieldProps("phone")} />
          {renderError("phone")}
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          {renderLabel("service")}
          <select {...fieldProps("service")}>
            <option value="">{content.placeholders.service}</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {renderError("service")}
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          {renderLabel("message")}
          <textarea rows={5} placeholder={content.placeholders.message} {...fieldProps("message")} />
          {renderError("message")}
        </div>
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${baseId}-${HONEYPOT_FIELD}`}>{content.honeypotLabel}</label>
        <input id={`${baseId}-${HONEYPOT_FIELD}`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div ref={widgetRef} className={styles.widget} />

      <button type="submit" className={styles.submit} disabled={sending} aria-describedby={statusId}>
        {sending ? content.sending : content.submit}
      </button>

      <p id={statusId} className={styles.status} role="status" aria-live="polite">
        {statusMessage(content, status)}
      </p>

      <p className={styles.privacy}>
        {content.privacy.before}
        <a href={PRIVACY_PATH}>{content.privacy.link}</a>
        {content.privacy.after}
      </p>

      <noscript>
        <p className={styles.noscript}>{content.noscript}</p>
      </noscript>
    </form>
  );
}
