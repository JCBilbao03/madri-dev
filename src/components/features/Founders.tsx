import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { founders } from '@/data/founders';

export function Founders() {
  return (
    <section id="founders" aria-labelledby="founders-heading" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Founders"
            title="The people you"
            titleAccent="actually work with"
            headingId="founders-heading"
            description="No account managers and no handoffs to a junior team after the contract is signed. You work directly with the two of us."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {founders.map((founder, index) => (
            <Reveal as="li" key={founder.id} delay={index * 0.08}>
              <article className="group h-full overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:border-accent/50">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={founder.photo}
                    alt={founder.photoAlt}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: founder.photoPosition ?? 'top' }}
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-ink">{founder.name}</h3>
                  <p className="mt-1 text-sm font-medium text-accent-soft">{founder.role}</p>
                  <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{founder.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
