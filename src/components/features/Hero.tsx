import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useUIStore } from '@/store/useUIStore';

const STATS = [
  { value: '40+', label: 'Applications shipped' },
  { value: '<1s', label: 'Median load time at launch' },
  { value: '10 wks', label: 'Typical discovery to launch' },
];

export function Hero() {
  const openContactModal = useUIStore((state) => state.openContactModal);
  const prefersReducedMotion = useReducedMotion();

  const rise = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* Decorative background wash — hidden from assistive tech. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-18rem] left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-accent/16 blur-[140px]" />
        <div className="absolute right-[-10rem] bottom-[-16rem] size-[30rem] rounded-full bg-accent-alt/12 blur-[130px]" />
      </div>

      <Container>
        <motion.div
          {...rise}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-ink-muted">
            <Sparkles className="size-3.5 text-accent-soft" aria-hidden="true" />
            Booking new projects for Q4
          </p>

          <h1 className="mt-6 font-display text-4xl leading-[1.1] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            Building <span className="text-gradient">High-Performance</span> Web Applications
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-ink-muted">
            We are a small senior team that turns messy business problems into software your customers
            actually enjoy using. Fixed scope, honest timelines, and code your team can maintain after
            we hand it over.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" onClick={openContactModal}>
              Book a Discovery Call
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="secondary" href="#services">
              View Our Work
            </Button>
            <Button size="lg" variant="secondary" to="/login">
              Browse rentals
            </Button>
          </div>
        </motion.div>

        <motion.dl
          {...rise}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-base px-6 py-7 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-semibold text-ink">{stat.value}</span>
                <span className="mt-1.5 block text-sm text-ink-muted">{stat.label}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
