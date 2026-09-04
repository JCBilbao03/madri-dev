import { Contact } from '@/components/features/Contact';
import { ContactModal } from '@/components/features/ContactModal';
import { Footer } from '@/components/features/Footer';
import { Founders } from '@/components/features/Founders';
import { Header } from '@/components/features/Header';
import { Hero } from '@/components/features/Hero';
import { Services } from '@/components/features/Services';
import { Workflow } from '@/components/features/Workflow';

export function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-70 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-base"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">
        <Hero />
        <Services />
        <Workflow />
        <Founders />
        <Contact />
      </main>

      <Footer />
      <ContactModal />
    </>
  );
}
