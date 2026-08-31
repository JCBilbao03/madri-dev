import { Check } from 'lucide-react';

import type { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { title, description, icon: Icon, highlights } = service;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:border-accent/50 hover:bg-surface-raised">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-accent/20 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">
        <span className="grid size-11 place-items-center rounded-xl border border-line bg-base text-accent-soft">
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{description}</p>

        <ul className="mt-5 flex flex-col gap-2">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2 text-sm text-ink-muted">
              <Check className="size-3.5 shrink-0 text-accent-soft" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
