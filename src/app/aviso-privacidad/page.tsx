/**
 * Aviso de privacidad integral (/aviso-privacidad), enlazado desde el
 * formulario, el pie y el banner de cookies.
 *
 * El texto vive en src/content/pages/privacy.json: un cambio pedido por el área
 * legal de SESLUM se hace ahí, sin tocar este archivo. Encabezado y pie propios
 * y mínimos, porque la navegación del sitio usa anclas de la página principal.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CONSENT_OPEN_ATTRIBUTE } from "@/lib/consent-runtime";
import { emailHref } from "@/lib/contact-links";
import { footer, navbar, privacy, site } from "@/lib/content";
import { copyrightLine } from "@/lib/footer-content";
import { PRIVACY_PATH } from "@/lib/privacy";
import { formatUpdated, splitEmails } from "@/lib/privacy-content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${privacy.title} | ${site.name}`,
  description: privacy.description,
  alternates: { canonical: PRIVACY_PATH },
  openGraph: { url: PRIVACY_PATH, title: `${privacy.title} | ${site.name}`, description: privacy.description },
};

function RichText({ text }: { readonly text: string }) {
  return (
    <>
      {splitEmails(text).map((part, index) =>
        part.kind === "email" ? (
          <a key={index} href={emailHref(part.value)}>
            {part.value}
          </a>
        ) : (
          part.value
        ),
      )}
    </>
  );
}

export default function PrivacyPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.logoLink}>
            <img className={styles.logo} src={navbar.logo.src} alt={navbar.logo.alt} width={navbar.logo.width} height={navbar.logo.height} />
          </Link>
          <Link href="/" className={styles.back}>
            {privacy.backLabel}
          </Link>
        </div>
      </header>

      <main id="main" className={`container ${styles.main}`}>
        <h1 className={styles.title}>{privacy.title}</h1>
        <p className={styles.updated}>
          {privacy.updatedLabel} <time dateTime={privacy.updated}>{formatUpdated(privacy.updated)}</time>
        </p>

        {privacy.sections.map((section) => (
          <section key={section.id} className={styles.section} aria-labelledby={`aviso-${section.id}`}>
            <h2 id={`aviso-${section.id}`} className={styles.heading}>
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>
                <RichText text={paragraph} />
              </p>
            ))}
            {section.list ? (
              <ul className={styles.list}>
                {section.list.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            ) : null}
            {section.closing?.map((paragraph) => (
              <p key={paragraph}>
                <RichText text={paragraph} />
              </p>
            ))}
          </section>
        ))}
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <p>{copyrightLine(year, site.name, footer.rights)}</p>
          <button type="button" className={styles.consentLink} {...{ [CONSENT_OPEN_ATTRIBUTE]: "" }}>
            {footer.consentLink}
          </button>
        </div>
      </footer>
    </>
  );
}
