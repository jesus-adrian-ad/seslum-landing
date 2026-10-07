/**
 * Página principal: compone las secciones en el orden del mapa del SPEC.
 */

import { WhatsAppFloat } from "@/components/WhatsAppFloat/WhatsAppFloat";
import { serviceOptions } from "@/lib/contact-form";
import { brands, contact, contactForm, faq, footer, hero, navbar, sectors, services, site, whySeslum } from "@/lib/content";
import { buildEnv } from "@/lib/env";
import { Brands } from "@/sections/Brands/Brands";
import { Contact } from "@/sections/Contact/Contact";
import { Faq } from "@/sections/Faq/Faq";
import { Footer } from "@/sections/Footer/Footer";
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
      <WhatsAppFloat whatsapp={site.contact.whatsapp} label={contact.floatingLabel} newTabHint={contact.newTabHint} />
    </>
  );
}
