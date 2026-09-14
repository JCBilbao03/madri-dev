import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section id="top" className="relative border-b border-line pt-36 pb-20 sm:pt-44 sm:pb-28">
      <Container>
        <motion.div
          {...rise}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="inline-flex items-center rounded-md border border-line bg-surface px-3 py-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
            MadriBuild — booking new projects for Q4
          </p>

          <h1 className="mt-6 font-display text-3xl leading-[1.12] font-semibold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            Building <span className="text-accent">high-performance</span> web applications
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-muted">
            MadriBuild is a small senior studio shipping React, Next.js, and Vite frontends styled
            with modern CSS frameworks like Tailwind — backed by Node.js, Express, and Firebase.
            Fixed scope, honest timelines, and code your team can maintain after we hand it over.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button size="lg" variant="cta" className="w-full sm:w-auto" onClick={openContactModal}>
              Book a Discovery Call
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="secondary" href="#work" className="w-full sm:w-auto">
              View our work
            </Button>
          </div>
        </motion.div>

        <motion.dl
          {...rise}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-surface px-6 py-6 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-medium tracking-tight text-ink">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm text-ink-muted">{stat.label}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
