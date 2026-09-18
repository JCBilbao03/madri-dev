import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { followUpLabel } from '@/lib/leadFollowUp';
import { buildLeadEmailPath } from '@/lib/leadOutreach';
import { isTodayFollowUp } from '@/lib/adminDashboard';
import type { Lead } from '@/types/admin';

interface DashboardActionQueueProps {
  leads: Lead[];
}

export function DashboardActionQueue({ leads }: DashboardActionQueueProps) {
  return (
    <section className="rounded-2xl border border-line/80 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Needs attention</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Leads with due or overdue follow-ups</p>
        </div>
        <Link
          to="/admin/leads?followUp=due"
          className="shrink-0 font-display text-sm font-medium text-accent-soft transition hover:text-ink"
        >
          View all →
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          No follow-ups due right now. Check back tomorrow or schedule reach-outs from the leads table.
        </p>
      ) : (
        <ul className="divide-y divide-line/80">
          {leads.map((lead) => {
            const emailPath = lead.email.trim() ? buildLeadEmailPath(lead) : null;
            const overdue = lead.followUpAt && !isTodayFollowUp(lead.followUpAt);

            return (
              <li key={lead.leadId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{lead.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <LeadStatusBadge status={lead.status} />
                    <span className={overdue ? 'text-xs text-danger' : 'text-xs text-ink-muted'}>
                      {followUpLabel(lead.followUpAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {emailPath ? (
                    <Link
                      to={emailPath}
                      aria-label={`Email ${lead.name}`}
                      title={`Email ${lead.name}`}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-raised hover:text-ink"
                    >
                      <Mail className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                  <Link
                    to="/admin/leads"
                    className="inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-xs font-medium text-ink-muted transition hover:bg-surface-raised hover:text-ink"
                  >
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
