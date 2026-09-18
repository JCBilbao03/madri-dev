import { Link } from 'react-router-dom';

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
            align="left"
            eyebrow="Work"
            title="Products we"
            titleAccent="built"
            headingId="work-heading"
            description="Three live apps on the same React and Firebase stack we ship for clients. Tap a card to walk through each demo."
            className="max-w-2xl"
            descriptionClassName="max-w-xl leading-7 text-ink/85"
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
          {works.map((work, index) => (
            <Reveal as="li" key={work.id} delay={index * 0.08} className="h-full min-w-0">
              <WorkCard work={work} index={index} />
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-ink-muted">
          We count anonymous demo opens (approximate country only) to understand interest.{' '}
          <Link to="/privacy" className="text-accent-soft underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </Container>
    </section>
  );
}
