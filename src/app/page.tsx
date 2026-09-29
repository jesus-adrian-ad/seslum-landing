/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 *
 * Mientras no hay secciones, muestra un marcador mínimo con el nombre y la
 * descripción del cliente. Se retira en cuanto entra el primer bloque visible.
 */

import { site } from "@/lib/content";
import "@/styles/pages/home.css";

export default function HomePage() {
  return (
    <main id="main" className="home-placeholder container">
      <h1 className="home-placeholder__title">{site.name}</h1>
      <p className="home-placeholder__text">{site.description}</p>
    </main>
  );
}
