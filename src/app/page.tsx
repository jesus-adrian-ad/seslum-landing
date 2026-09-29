/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 *
 * Mientras llegan las secciones, el cuerpo muestra un marcador mínimo con el
 * nombre y la descripción del cliente; se retira con el bloque del encabezado.
 */

import { navbar, site } from "@/lib/content";
import { Navbar } from "@/sections/Navbar/Navbar";
import "@/styles/pages/home.css";

export default function HomePage() {
  return (
    <>
      <Navbar content={navbar} />
      <main id="main" className="home-placeholder container">
        <h1 className="home-placeholder__title">{site.name}</h1>
        <p className="home-placeholder__text">{site.description}</p>
      </main>
    </>
  );
}
