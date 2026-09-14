import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { WorkPreview } from '@/components/features/WorkPreview';
import type { Work } from '@/data/works';

interface WorkCardProps {
  work: Work;
  index: number;
}

export function WorkCard({ work, index }: WorkCardProps) {
  const { title, category, description, href, ctaLabel, preview, appSlug, stack, highlights } = work;
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-accent/35 hover:bg-surface-raised hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <Link
        to={href}
        aria-label={`${ctaLabel} — ${title}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base"
      />

      <WorkPreview variant={preview} category={category} appSlug={appSlug} />

      <div className="relative flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-medium tracking-tight text-ink">{title}</h3>
          <span className="shrink-0 font-display text-xs tracking-[0.16em] text-ink-muted">{indexLabel}</span>
        </div>
        <p className="mt-4 max-w-prose text-base leading-7 text-pretty text-ink/85">{description}</p>

        <ul className="mt-6 flex flex-col gap-3">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-base leading-relaxed text-ink/80">
              <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-md border border-line bg-base/50 px-2.5 py-1 text-xs font-display text-ink-muted transition-colors duration-150 hover:border-accent/30 hover:text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-col gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
        <p className="text-sm text-ink/70">Live demo · MadriBuild</p>
        <span
          aria-hidden="true"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-base px-4 py-2.5 text-base font-medium text-ink transition-colors duration-150 group-hover:border-accent/40 group-hover:bg-surface sm:w-auto sm:justify-start"
        >
          {ctaLabel}
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
