/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 */

import { hero, navbar, sectors, services, whySeslum } from "@/lib/content";
import { Hero } from "@/sections/Hero/Hero";
import { Navbar } from "@/sections/Navbar/Navbar";
import { Sectors } from "@/sections/Sectors/Sectors";
import { Services } from "@/sections/Services/Services";
import { WhySeslum } from "@/sections/WhySeslum/WhySeslum";

export default function HomePage() {
  return (
    <>
      <Navbar content={navbar} />
      <main id="main">
        <Hero content={hero} />
        <Services content={services} />
        <Sectors content={sectors} />
        <WhySeslum content={whySeslum} />
      </main>
    </>
  );
}
