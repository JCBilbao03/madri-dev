import { LeadAssigneeSelect } from '@/components/admin/LeadAssigneeSelect';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect';
import {
  APP_LABELS,
  formatLeadDate,
  leadAssigneeLabel,
  LEAD_SOURCE_LABELS,
  type Lead,
  type LeadAdminOption,
  type LeadStatus,
} from '@/types/admin';

export interface LeadItemProps {
  lead: Lead;
  admins?: LeadAdminOption[];
  onStatus?: (leadId: string, status: LeadStatus) => void | Promise<void>;
  onAssignee?: (leadId: string, assigneeId: string) => void | Promise<void>;
  onEdit?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

function formatLeadTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function LeadCard({ lead, admins = [], onStatus, onAssignee, onEdit, onNotes, onDelete }: LeadItemProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);

  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">{lead.name}</p>
          <a href={`mailto:${lead.email}`} className="mt-1 block break-all text-sm text-accent-soft">
            {lead.email}
          </a>
        </div>
        <p className="shrink-0 text-right text-xs text-ink-muted">
          {formatLeadDate(lead.createdAt)}
          <span className="mt-0.5 block">{formatLeadTime(lead.createdAt)}</span>
        </p>
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {APP_LABELS[lead.appId]}
        <span aria-hidden="true"> · </span>
        {LEAD_SOURCE_LABELS[lead.source]}
      </p>
      <p className="mt-2 text-sm text-ink">{lead.summary}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {onStatus ? (
          <LeadStatusSelect
            leadId={lead.leadId}
            name={lead.name}
            status={lead.status}
            onStatus={onStatus}
            className="h-11 min-w-0 text-sm"
          />
        ) : (
          <LeadStatusBadge status={lead.status} />
        )}
        {onAssignee ? (
          <LeadAssigneeSelect
            leadId={lead.leadId}
            name={lead.name}
            assigneeId={lead.assigneeId}
            assigneeName={lead.assigneeName}
            admins={admins}
            onAssignee={onAssignee}
            className="h-11 min-w-0 text-sm"
          />
        ) : (
          <p className="flex h-11 items-center text-sm text-ink-muted">{leadAssigneeLabel(lead, admins)}</p>
        )}
      </div>

      {canManage && onEdit && onNotes && onDelete ? (
        <div className="mt-4">
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} labeled />
        </div>
      ) : null}
    </article>
  );
}
