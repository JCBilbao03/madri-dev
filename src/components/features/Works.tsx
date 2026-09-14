import { WorkCard } from '@/components/features/WorkCard';
import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { works } from '@/data/works';

export function Works() {
  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-24 border-y border-line bg-surface/40 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Work"
            title="Products we"
            titleAccent="built"
            headingId="work-heading"
            description="Two live marketplaces on the same React and Firebase stack we ship for clients. Tap a card to walk through each app."
            className="max-w-xl"
            descriptionClassName="max-w-lg leading-7 text-ink/85"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {works.map((work, index) => (
            <Reveal as="li" key={work.id} delay={index * 0.08} className="h-full">
              <WorkCard work={work} index={index} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
