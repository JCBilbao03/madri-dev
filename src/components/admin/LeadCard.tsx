import { LeadAssigneeSelect } from '@/components/admin/LeadAssigneeSelect';
import { LeadFollowUpBadge } from '@/components/admin/LeadFollowUpBadge';
import { LeadReachOutSelect } from '@/components/admin/LeadReachOutSelect';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect';
import { isFollowUpDue } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';
import {
  APP_LABELS,
  formatLeadDate,
  formatLeadSource,
  leadAssigneeLabel,
  type Lead,
  type LeadAdminOption,
  type LeadStatus,
} from '@/types/admin';

export interface LeadItemProps {
  lead: Lead;
  admins?: LeadAdminOption[];
  onStatus?: (leadId: string, status: LeadStatus) => void | Promise<void>;
  onAssignee?: (leadId: string, assigneeId: string) => void | Promise<void>;
  onFollowUp?: (leadId: string, followUpAt: string) => void | Promise<void>;
  onEdit?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

export function LeadCard({
  lead,
  admins = [],
  onStatus,
  onAssignee,
  onFollowUp,
  onEdit,
  onNotes,
  onDelete,
}: LeadItemProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);
  const isDue = isFollowUpDue(lead.followUpAt, lead.status);

  return (
    <article className={cn('py-4', isDue && 'bg-danger/[0.03]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">{lead.name}</p>
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="mt-0.5 block break-all text-sm text-ink-muted hover:text-ink">
              {lead.email}
            </a>
          ) : null}
          <LeadFollowUpBadge followUpAt={lead.followUpAt} status={lead.status} className="mt-1 block" />
        </div>
        <p className="shrink-0 text-xs text-ink-muted">{formatLeadDate(lead.createdAt)}</p>
      </div>

      <p className="mt-2 text-sm text-ink-muted">
        {APP_LABELS[lead.appId]}
        <span aria-hidden="true"> · </span>
        {formatLeadSource(lead)}
      </p>
      <p className="mt-1 text-sm text-ink">{lead.summary}</p>

      <div className="mt-3 space-y-2">
        {onFollowUp ? (
          <LeadReachOutSelect
            leadId={lead.leadId}
            name={lead.name}
            followUpAt={lead.followUpAt}
            onFollowUp={onFollowUp}
            className="w-full min-w-0"
          />
        ) : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {onStatus ? (
            <LeadStatusSelect
              leadId={lead.leadId}
              name={lead.name}
              status={lead.status}
              onStatus={onStatus}
              className="h-10 min-w-0 w-full rounded-lg text-sm"
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
              className="h-10 min-w-0 w-full rounded-lg text-sm"
            />
          ) : (
            <p className="flex h-10 items-center text-sm text-ink-muted">{leadAssigneeLabel(lead, admins)}</p>
          )}
        </div>
      </div>

      {canManage && onEdit && onNotes && onDelete ? (
        <div className="mt-3">
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} labeled />
        </div>
      ) : null}
    </article>
  );
}
