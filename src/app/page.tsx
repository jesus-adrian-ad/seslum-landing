/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 */

import { hero, navbar } from "@/lib/content";
import { Hero } from "@/sections/Hero/Hero";
import { Navbar } from "@/sections/Navbar/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar content={navbar} />
      <main id="main">
        <Hero content={hero} />
      </main>
    </>
  );
}
