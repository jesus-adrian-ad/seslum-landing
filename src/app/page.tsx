/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 */

import { hero, navbar, services } from "@/lib/content";
import { Hero } from "@/sections/Hero/Hero";
import { Navbar } from "@/sections/Navbar/Navbar";
import { Services } from "@/sections/Services/Services";

export default function HomePage() {
  return (
    <>
      <Navbar content={navbar} />
      <main id="main">
        <Hero content={hero} />
        <Services content={services} />
      </main>
    </>
  );
}
