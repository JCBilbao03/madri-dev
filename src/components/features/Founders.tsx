import { FounderPortrait } from '@/components/features/FounderPortrait';
import { StartProjectButton } from '@/components/features/StartProjectButton';
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
            eyebrow="Team"
            title="Direct access to the"
            titleAccent="founders"
            headingId="founders-heading"
            description="No account managers, no middle-men, and no handoffs to a junior team after signing. You collaborate directly with the senior partners building your product."
            className="max-w-2xl"
          />
        </Reveal>

        <ul className="mx-auto mt-14 grid max-w-xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-16 sm:gap-y-16">
          {founders.map((founder, index) => (
            <Reveal as="li" key={founder.id} delay={index * 0.06}>
              <FounderPortrait founder={founder} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.16}>
          <div className="mt-20 flex flex-col items-center text-center sm:mt-24">
            <h3 className="font-display text-2xl font-medium tracking-tight text-balance text-ink sm:text-3xl">
              Let&apos;s assemble your team
            </h3>
            <p className="mt-3 max-w-md text-base leading-relaxed text-pretty text-ink-muted">
              Start with a direct discovery call with us to map your scope, architecture, and timeline.
            </p>
            <StartProjectButton size="lg" className="mt-8 w-full sm:w-auto" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
