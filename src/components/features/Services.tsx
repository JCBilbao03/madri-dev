import { ServiceCard } from '@/components/features/ServiceCard';
import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { services } from '@/data/services';

export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Services"
            title="What we"
            titleAccent="build"
            headingId="services-heading"
            description="Six things we do well, rather than twenty we do adequately. Every engagement is staffed by the same senior people from first call to handover."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal as="li" key={service.id} delay={index * 0.06} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
