/**
 * Página principal: compone las secciones en el orden del mapa del SPEC y monta
 * una sola vez la entrada al hacer scroll de las que la usan (Proyectos la resuelve
 * con CSS, por eso no está en la lista). Con el sitio en construcción solo se
 * publica la página ComingSoon: ninguna sección llega al HTML.
 */

import { ComingSoon } from "@/components/ComingSoon/ComingSoon";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { WhatsAppFloat } from "@/components/WhatsAppFloat/WhatsAppFloat";
import { serviceOptions } from "@/lib/contact-form";
import { brands, comingSoon, contact, contactForm, faq, footer, hero, navbar, projects, sectors, services, site, whySeslum } from "@/lib/content";
import { buildEnv, isComingSoon } from "@/lib/env";
import { Brands } from "@/sections/Brands/Brands";
import { Contact } from "@/sections/Contact/Contact";
import { Faq } from "@/sections/Faq/Faq";
import { Footer } from "@/sections/Footer/Footer";
import { Hero } from "@/sections/Hero/Hero";
import { Navbar } from "@/sections/Navbar/Navbar";
import { Projects } from "@/sections/Projects/Projects";
import { Sectors } from "@/sections/Sectors/Sectors";
import { Services } from "@/sections/Services/Services";
import { WhySeslum } from "@/sections/WhySeslum/WhySeslum";

const REVEAL_ROOT_IDS = [services.id, sectors.id, whySeslum.id, brands.id, faq.id, contact.id, footer.id];

export default function HomePage() {
  if (isComingSoon) {
    return <ComingSoon content={comingSoon} />;
  }
  return (
    <>
      <Navbar content={navbar} />
      <main id="main">
        <Hero content={hero} />
        <Services content={services} />
        <Sectors content={sectors} />
        <WhySeslum content={whySeslum} />
        <Projects content={projects} />
        <Brands content={brands} />
        <Faq content={faq} />
        <Contact
          content={contact}
          contact={site.contact}
          location={site.location}
          form={contactForm}
          services={serviceOptions(services)}
          turnstileSiteKey={buildEnv.turnstileSiteKey}
        />
      </main>
      <Footer content={footer} site={site} navigation={navbar.links} services={services} logo={navbar.logo} />
      <WhatsAppFloat
        whatsapp={site.contact.whatsapp}
        label={contact.floatingLabel}
        channelHint={contact.floatingChannelHint}
        newTabHint={contact.newTabHint}
      />
      <ScrollReveal rootIds={REVEAL_ROOT_IDS} />
    </>
  );
}
