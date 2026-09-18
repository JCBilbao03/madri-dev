import { useCallback, type MouseEvent } from 'react';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import { AdminStatusDot } from '@/components/admin/AdminStatusDot';
import { LeadFollowUpBadge } from '@/components/admin/LeadFollowUpBadge';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
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
  onEdit,
  onNotes,
  onDelete,
}: LeadItemProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);
  const isDue = isFollowUpDue(lead.followUpAt, lead.status);
  const ownerLabel = leadAssigneeLabel(lead, admins);

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!onEdit) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (
        target.closest(
          'button, a, input, select, textarea, [role="menu"], [role="menuitem"], [aria-haspopup="menu"], [data-lead-row-actions]',
        )
      ) {
        return;
      }

      onEdit(lead);
    },
    [lead, onEdit],
  );

  return (
    <article
      onClick={onEdit ? handleCardClick : undefined}
      className={cn('rounded-xl py-4', onEdit && 'cursor-pointer', isDue && 'bg-danger/[0.03]')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ink">{lead.name}</p>
          <LeadFollowUpBadge followUpAt={lead.followUpAt} status={lead.status} className="mt-1 block" />
        </div>
        <p className="shrink-0 text-xs text-ink-muted">{formatLeadDate(lead.createdAt)}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <AdminAvatar name={APP_LABELS[lead.appId]} size="sm" />
          {APP_LABELS[lead.appId]}
        </span>
        <span aria-hidden="true">·</span>
        <span>{formatLeadSource(lead)}</span>
        <span aria-hidden="true">·</span>
        <span>{ownerLabel}</span>
      </div>

      <p className="mt-2 text-sm text-ink">{lead.summary}</p>

      <div className="mt-3">
        <AdminStatusDot status={lead.status} />
      </div>

      {canManage && onEdit && onNotes && onDelete ? (
        <div className="mt-3">
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} labeled />
        </div>
      ) : null}
    </article>
  );
}
