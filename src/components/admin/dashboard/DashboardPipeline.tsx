import { Link } from 'react-router-dom';

import { LEAD_STATUSES } from '@/types/admin';
import type { DashboardLeadStats } from '@/lib/adminDashboard';

interface DashboardPipelineProps {
  stats: DashboardLeadStats;
}

const STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed',
};

const STATUS_COLORS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: 'bg-emerald-500',
  contacted: 'bg-sky-500',
  qualified: 'bg-amber-500',
  closed: 'bg-zinc-400',
};

export function DashboardPipeline({ stats }: DashboardPipelineProps) {
  const activeTotal = stats.byStatus.new + stats.byStatus.contacted + stats.byStatus.qualified;

  return (
    <section className="rounded-2xl border border-line/80 bg-surface px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Lead pipeline</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {activeTotal} active · {stats.byStatus.closed} closed
          </p>
        </div>
        <Link
          to="/admin/leads"
          className="font-display text-sm font-medium text-accent-soft transition hover:text-ink"
        >
          Manage leads →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEAD_STATUSES.map((status) => {
          const count = stats.byStatus[status];
          const share = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

          return (
            <div key={status} className="rounded-xl border border-line/80 bg-base/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cnDot(STATUS_COLORS[status])} aria-hidden="true" />
                <span className="text-xs font-medium text-ink-muted">{STATUS_LABELS[status]}</span>
              </div>
              <p className="mt-2 font-display text-xl font-semibold tabular-nums text-ink">{count}</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{share}% of total</p>
            </div>
          );
        })}
      </div>

      {stats.total > 0 ? (
        <div className="mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-raised">
            {LEAD_STATUSES.map((status) => {
              const width = (stats.byStatus[status] / stats.total) * 100;
              if (width <= 0) {
                return null;
              }

              return (
                <div
                  key={status}
                  className={STATUS_COLORS[status]}
                  style={{ width: `${width}%` }}
                  title={`${STATUS_LABELS[status]}: ${stats.byStatus[status]}`}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function cnDot(colorClass: string): string {
  return `size-2 shrink-0 rounded-full ${colorClass}`;
}
