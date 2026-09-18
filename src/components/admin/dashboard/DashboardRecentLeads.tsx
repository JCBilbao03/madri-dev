import { Link } from 'react-router-dom';

import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { APP_LABELS, formatLeadDate, type Lead } from '@/types/admin';

interface DashboardRecentLeadsProps {
  leads: Lead[];
}

export function DashboardRecentLeads({ leads }: DashboardRecentLeadsProps) {
  return (
    <section className="rounded-2xl border border-line/80 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Latest leads</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Most recently added to the pipeline</p>
        </div>
        <Link
          to="/admin/leads"
          className="shrink-0 font-display text-sm font-medium text-accent-soft transition hover:text-ink"
        >
          View all →
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">No leads yet. Import a spreadsheet or add one manually.</p>
      ) : (
        <ul className="divide-y divide-line/80">
          {leads.map((lead) => (
            <li key={lead.leadId} className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {APP_LABELS[lead.appId]} · {lead.email.trim() || 'No email'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <LeadStatusBadge status={lead.status} />
                <span className="text-[11px] text-ink-muted tabular-nums">{formatLeadDate(lead.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
