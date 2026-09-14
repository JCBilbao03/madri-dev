import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { workflowSteps } from '@/data/workflow';

export function Workflow() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="scroll-mt-24 border-y border-line bg-surface/40 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Process"
            title="From first call to"
            titleAccent="launch"
            headingId="process-heading"
            description="A predictable ten-week rhythm. You always know what is being worked on, what is coming next, and what it costs."
          />
        </Reveal>

        <ol className="relative mt-14 grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
          {/* The rail sits behind the step markers: vertical on mobile, horizontal from lg up. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[1.375rem] w-px bg-line lg:top-[1.375rem] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto"
          />

          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Reveal
                as="li"
                key={step.id}
                delay={index * 0.08}
                className="relative flex gap-5 lg:flex-col lg:gap-0"
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent-soft"
                >
                  <Icon className="size-5" />
                </span>

                <div className="lg:mt-6">
                  <p className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase">
                    Step {index + 1} · {step.duration}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted lg:pr-4">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
