import { useEffect, useMemo, useState } from 'react';

import { AppCard } from '@/components/admin/AppCard';
import { Container } from '@/components/ui/Container';
import { ADMIN_APPS } from '@/data/adminApps';
import { fetchLeads } from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
import type { AppId, Lead } from '@/types/admin';

export function AdminAppsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void fetchLeads()
      .then((nextLeads) => {
        if (!active) {
          return;
        }

        setLeads(nextLeads);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(authErrorMessage(loadError));
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const next: Record<AppId, number> = { marketing: 0, rental: 0, cleaning: 0 };
    for (const lead of leads) {
      next[lead.appId] += 1;
    }
    return next;
  }, [leads]);

  return (
    <main id="main" className="min-h-svh bg-base pt-36 pb-24 lg:pt-28 lg:pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Admin</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Apps</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Products in this workspace and how many leads each one has generated.
        </p>

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading apps…</p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ADMIN_APPS.map((app) => (
              <li key={app.id}>
                <AppCard app={app} leadCount={counts[app.id]} />
              </li>
            ))}
          </ul>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Container>
    </main>
  );
}
