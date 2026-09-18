import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import type { AdminApp } from '@/data/adminApps';
import { cn } from '@/lib/utils';
import type { DemoAppTrafficSummary } from '@/types/appTraffic';

interface AppCardProps {
  app: AdminApp;
  leadCount: number;
  visitSummary?: DemoAppTrafficSummary;
}

export function AppCard({ app, leadCount, visitSummary }: AppCardProps) {
  return (
    <article
      className={cn(
        'group rounded-2xl border border-line/80 bg-surface p-5 transition',
        'hover:border-line hover:shadow-md hover:shadow-ink/5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <AdminAvatar name={app.name} size="md" />
        <div className="flex flex-col items-end gap-1">
          {visitSummary ? (
            <span className="rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-muted">
              {visitSummary.viewsLast7Days} visits / 7d
            </span>
          ) : null}
          <span className="rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium text-ink-muted">
            {leadCount} {leadCount === 1 ? 'lead' : 'leads'}
          </span>
        </div>
      </div>

      <h2 className="mt-4 font-display text-lg font-semibold text-ink">{app.name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{app.description}</p>

      <Link
        to={app.href}
        className="mt-5 inline-flex items-center gap-1 font-display text-sm font-medium text-accent-soft transition group-hover:text-ink"
      >
        Open app
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
