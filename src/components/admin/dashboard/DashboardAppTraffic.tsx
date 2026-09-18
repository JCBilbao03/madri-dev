import { Link } from 'react-router-dom';

import { countryLabel, trackedAppLabel } from '@/lib/appTraffic';
import type { DemoAppId, DemoAppTrafficSummary } from '@/types/appTraffic';

interface DashboardAppTrafficProps {
  summaries: DemoAppTrafficSummary[];
}

function visitDetail(entry: DemoAppTrafficSummary): string {
  if (entry.appId === 'marketing') {
    return `${entry.viewsLast7Days} landing visits this week`;
  }

  return `${entry.viewsLast7Days} visits this week · ${entry.fromWorksViews} from Works (all time)`;
}

export function DashboardAppTraffic({ summaries }: DashboardAppTrafficProps) {
  const sorted = [...summaries].sort((left, right) => right.viewsLast7Days - left.viewsLast7Days);

  return (
    <section className="rounded-2xl border border-line/80 bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Site traffic</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Landing page and demo app visits. Country is approximate; no personal data stored.
          </p>
        </div>
        <Link
          to="/admin/apps"
          className="font-display text-sm font-medium text-accent-soft transition hover:text-ink"
        >
          View apps →
        </Link>
      </div>

      {sorted.every((entry) => entry.viewsLast7Days === 0 && entry.totalViews === 0) ? (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          No visits recorded yet. Open the landing page or a Works demo to generate data.
        </p>
      ) : (
        <div className="divide-y divide-line/80">
          {sorted.map((entry) => {
            const topCountry = entry.topCountries[0];

            return (
              <div key={entry.appId} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{trackedAppLabel(entry.appId as DemoAppId)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{visitDetail(entry)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink">
                    {entry.totalViews} total
                  </span>
                  {topCountry ? (
                    <span className="rounded-full border border-line bg-base px-2.5 py-0.5 text-xs text-ink-muted">
                      Top: {countryLabel(topCountry.code)} ({topCountry.count})
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="border-t border-line px-4 py-3 text-[11px] leading-relaxed text-ink-muted sm:px-5">
        Aggregated analytics only — no names, emails, or stored IP addresses. See{' '}
        <Link to="/privacy" className="text-accent-soft underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
