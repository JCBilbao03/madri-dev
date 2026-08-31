import { CircleCheck, Mail } from 'lucide-react';

import { ContactForm } from '@/components/features/ContactForm';
import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CONTACT_EMAIL } from '@/data/navigation';

const PROMISES = [
  'A reply within one business day',
  'A named senior engineer on every call',
  'A fixed quote before any code is written',
];

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 border-t border-line py-20 sm:py-28"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeader
              eyebrow="Contact"
              title="Tell us what you are"
              titleAccent="building"
              align="left"
              headingId="contact-heading"
              description="Send a short brief and we will come back with an honest read on scope, timeline, and whether we are the right team for it."
            />

            <ul className="mt-8 flex flex-col gap-3">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent-soft" aria-hidden="true" />
                  {promise}
                </li>
              ))}
            </ul>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink transition hover:border-accent/60"
            >
              <Mail className="size-4 text-accent-soft" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
