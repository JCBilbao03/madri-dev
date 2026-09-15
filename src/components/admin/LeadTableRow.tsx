import { LeadAssigneeSelect } from '@/components/admin/LeadAssigneeSelect';
import { LeadFollowUpBadge } from '@/components/admin/LeadFollowUpBadge';
import { LeadReachOutSelect } from '@/components/admin/LeadReachOutSelect';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect';
import { isFollowUpDue } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';
import { APP_LABELS, formatLeadDate, formatLeadSource, leadAssigneeLabel } from '@/types/admin';

import type { LeadItemProps } from '@/components/admin/LeadCard';

export function LeadTableRow({
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
    <tr className={cn('border-t border-line', isDue && 'bg-danger/[0.03]')}>
      <td className="whitespace-nowrap px-3 py-3 align-top text-sm text-ink-muted">{formatLeadDate(lead.createdAt)}</td>
      <td className="max-w-[12rem] px-3 py-3 align-top">
        <p className="font-medium text-ink">{lead.name}</p>
        <LeadFollowUpBadge followUpAt={lead.followUpAt} status={lead.status} className="mt-0.5 block" />
      </td>
      <td className="max-w-[14rem] px-3 py-3 align-top">
        {lead.email ? (
          <a href={`mailto:${lead.email}`} className="break-all text-sm text-ink-muted hover:text-ink">
            {lead.email}
          </a>
        ) : (
          <span className="text-ink-muted">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top text-sm text-ink-muted">{APP_LABELS[lead.appId]}</td>
      <td className="whitespace-nowrap px-3 py-3 align-top text-sm text-ink-muted">{formatLeadSource(lead)}</td>
      <td className="min-w-[16rem] px-3 py-3 align-top text-sm text-ink">{lead.summary}</td>
      <td className="whitespace-nowrap px-3 py-3 align-top">
        {onFollowUp ? (
          <LeadReachOutSelect
            leadId={lead.leadId}
            name={lead.name}
            followUpAt={lead.followUpAt}
            onFollowUp={onFollowUp}
          />
        ) : (
          <span className="text-sm text-ink-muted">{lead.followUpAt || '—'}</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top">
        {onStatus ? (
          <LeadStatusSelect
            leadId={lead.leadId}
            name={lead.name}
            status={lead.status}
            onStatus={onStatus}
            className="h-9 min-w-[8.5rem] rounded-lg text-sm"
          />
        ) : (
          <LeadStatusBadge status={lead.status} />
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top">
        {onAssignee ? (
          <LeadAssigneeSelect
            leadId={lead.leadId}
            name={lead.name}
            assigneeId={lead.assigneeId}
            assigneeName={lead.assigneeName}
            admins={admins}
            onAssignee={onAssignee}
            className="h-9 min-w-[8.5rem] rounded-lg text-sm"
          />
        ) : (
          <span className="text-sm text-ink-muted">{leadAssigneeLabel(lead, admins)}</span>
        )}
      </td>
      {canManage && onEdit && onNotes && onDelete ? (
        <td className="whitespace-nowrap px-3 py-3 align-top">
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} />
        </td>
      ) : null}
    </tr>
  );
}
