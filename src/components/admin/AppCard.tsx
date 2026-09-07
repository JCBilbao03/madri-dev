import { Link } from 'react-router-dom';

import type { AdminApp } from '@/data/adminApps';

interface AppCardProps {
  app: AdminApp;
  leadCount: number;
}

export function AppCard({ app, leadCount }: AppCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm font-medium text-accent-soft">{app.id}</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">{app.name}</h2>
      <p className="mt-2 text-sm text-ink-muted">{app.description}</p>
      <p className="mt-4 text-sm text-ink">
        {leadCount} {leadCount === 1 ? 'lead' : 'leads'}
      </p>
      <Link to={app.href} className="mt-4 inline-flex text-sm font-medium text-accent-soft hover:text-ink">
        Open app
      </Link>
    </article>
  );
}
