import { FileSpreadsheet, FileText, Inbox, MailPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

interface DashboardQuickActionsProps {
  dueCount: number;
}

export function DashboardQuickActions({ dueCount }: DashboardQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button to="/admin/leads?followUp=due" variant={dueCount > 0 ? 'cta' : 'secondary'} size="sm" className="min-h-9">
        <Inbox className="size-4" aria-hidden="true" />
        {dueCount > 0 ? `${dueCount} due follow-up${dueCount === 1 ? '' : 's'}` : 'Follow-ups'}
      </Button>
      <Button to="/admin/email?compose=1" variant="secondary" size="sm" className="min-h-9">
        <MailPlus className="size-4" aria-hidden="true" />
        Compose
      </Button>
      <Button to="/admin/leads" variant="secondary" size="sm" className="min-h-9">
        <FileSpreadsheet className="size-4" aria-hidden="true" />
        Leads
      </Button>
      <Button to="/admin/email/templates" variant="secondary" size="sm" className="min-h-9">
        <FileText className="size-4" aria-hidden="true" />
        Templates
      </Button>
      <Link
        to="/admin/email"
        className="inline-flex min-h-9 items-center rounded-full px-3 text-sm font-medium text-accent-soft transition hover:text-ink"
      >
        Open inbox →
      </Link>
    </div>
  );
}
