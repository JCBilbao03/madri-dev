import { Check } from 'lucide-react';

import type { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { title, description, icon: Icon, highlights } = service;

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-ink-muted/25 hover:bg-surface-raised">
      <span className="grid size-10 place-items-center rounded-lg border border-line bg-base text-accent-soft">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>

      <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-2 text-sm text-ink-muted">
            <Check className="size-3.5 shrink-0 text-accent-soft" aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>
    </article>
  );
}
