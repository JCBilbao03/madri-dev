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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-medium tracking-tight text-ink sm:text-xl">{title}</h3>
            <span className="shrink-0 font-display text-xs tracking-[0.16em] text-ink-muted">{indexLabel}</span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-pretty text-ink/85">{description}</p>

          <ul className="mt-4 flex flex-col gap-2">
            {highlights.slice(0, 3).map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm leading-snug text-ink/80">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span className="line-clamp-2">{highlight}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {stack.map((item) => (
              <li
                key={item}
                className="rounded-md border border-line bg-base/50 px-2 py-0.5 text-[11px] font-display text-ink-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col gap-2 border-t border-line px-5 py-4 sm:px-6">
          <p className="text-xs text-ink/70">Live demo · MadriBuild</p>
          <span
            aria-hidden="true"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 group-hover:border-accent/40 group-hover:bg-surface"
          >
            {ctaLabel}
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
