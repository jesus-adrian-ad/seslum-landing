/**
 * Alianzas comerciales: respaldo de fabricante, logos de las marcas con las que
 * se trabaja y, en texto, las que todavía no tienen logo.
 *
 * Una marca pasa de texto a logo cambiando solo brands.json. Los logos van en
 * sus colores originales sobre tarjetas blancas. Desde 860 px, texto y respaldos a la
 * izquierda y alianzas a la derecha.
 */

import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";
import type { BrandsContent } from "@/types/content";
import styles from "./Brands.module.css";

export interface BrandsProps {
  readonly content: BrandsContent;
}

export function Brands({ content }: BrandsProps) {
  const titleId = `${content.id}-title`;
  const partnersId = `${content.id}-partners`;
  const alsoId = `${content.id}-also`;

  return (
    <section id={content.id} className={styles.brands} aria-labelledby={titleId}>
      <div className={`container ${styles.layout}`}>
        <div>
          <SectionHeading titleId={titleId} eyebrow={content.eyebrow} title={content.title} lead={content.lead} />
          <dl className={styles.backing} data-reveal="">
            {content.backing.map((item) => (
              <div key={item.value} className={styles.backingItem}>
                <dt className={styles.backingValue}>{item.value}</dt>
                <dd className={styles.backingLabel}>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.aside}>
          <h3 id={partnersId} className="visually-hidden">
            {content.partnersLabel}
          </h3>
          <ul className={styles.partners} aria-labelledby={partnersId} role="list">
            {content.partners.map(({ id, logo }) => (
              <li key={id} className={`chamfer-frame ${styles.partner}`} data-reveal="">
                <img
                  className={styles.logo}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
          </ul>

          <div className={styles.also} data-reveal="">
            <h3 id={alsoId} className={styles.alsoTitle}>
              {content.alsoTitle}
            </h3>
            <dl className={styles.groups} aria-labelledby={alsoId}>
              {content.alsoGroups.map((group) => (
                <div key={group.id} className={styles.group}>
                  <dt className={styles.groupName}>{group.name}</dt>
                  <dd className={styles.groupBrands}>
                    <ul className={styles.brandList} role="list">
                      {group.brands.map((brand) => (
                        <li key={brand} className={styles.brand}>
                          {brand}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <ScrollReveal rootId={content.id} />
    </section>
  );
}
