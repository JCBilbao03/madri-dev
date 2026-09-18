import { useEffect, useMemo, useState } from 'react';

import { AdminPage } from '@/components/admin/AdminPage';
import { AppCard } from '@/components/admin/AppCard';
import { ADMIN_APPS } from '@/data/adminApps';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import { countryLabel, fetchDemoAppTrafficSummaries } from '@/lib/appTraffic';
import { fetchLeads } from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
import type { AppId, Lead } from '@/types/admin';
import type { DemoAppId, DemoAppTrafficSummary } from '@/types/appTraffic';

export function AdminAppsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<DemoAppTrafficSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Apps' }],
    }),
    [],
  );

  useEffect(() => {
    let active = true;

    void Promise.all([fetchLeads(), fetchDemoAppTrafficSummaries()])
      .then(([nextLeads, nextTraffic]) => {
        if (!active) {
          return;
        }

        setLeads(nextLeads);
        setTraffic(nextTraffic);
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

  const leadCounts = useMemo(() => {
    const next: Record<AppId, number> = { marketing: 0, rental: 0, cleaning: 0, inventory: 0 };
    for (const lead of leads) {
      next[lead.appId] += 1;
    }
    return next;
  }, [leads]);

  const trafficByApp = useMemo(() => {
    const next: Partial<Record<DemoAppId, DemoAppTrafficSummary>> = {};
    for (const entry of traffic) {
      next[entry.appId] = entry;
    }
    return next;
  }, [traffic]);

  return (
    <AdminPage>
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-sm text-ink-muted">
          Products in this workspace with anonymous demo visit counts (approximate country) and lead conversions.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-ink-muted">Loading apps…</p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {ADMIN_APPS.map((app) => {
              const visitSummary = app.id === 'marketing' ? undefined : trafficByApp[app.id as DemoAppId];

              return (
                <li key={app.id}>
                  <AppCard app={app} leadCount={leadCounts[app.id]} visitSummary={visitSummary} />
                </li>
              );
            })}
          </ul>
        )}

        {!isLoading && traffic.length > 0 ? (
          <section className="mt-10 rounded-2xl border border-line/80 bg-surface p-5">
            <h2 className="font-display text-base font-semibold text-ink">Top countries (last 7 days)</h2>
            <p className="mt-1 text-xs text-ink-muted">Aggregated only — no stored IP addresses.</p>
            <ul className="mt-4 space-y-4">
              {traffic.map((entry) => (
                <li key={entry.appId}>
                  <p className="text-sm font-medium capitalize text-ink">{entry.appId}</p>
                  {entry.topCountries.length === 0 ? (
                    <p className="mt-1 text-xs text-ink-muted">No visits this week.</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {entry.topCountries.map((country) => (
                        <li
                          key={`${entry.appId}-${country.code}`}
                          className="rounded-full border border-line bg-base px-2.5 py-0.5 text-xs text-ink-muted"
                        >
                          {countryLabel(country.code)} · {country.count}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    </AdminPage>
  );
}
