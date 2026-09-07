import { LeadAssigneeSelect } from '@/components/admin/LeadAssigneeSelect';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect';
import { APP_LABELS, formatLeadDate, leadAssigneeLabel, LEAD_SOURCE_LABELS } from '@/types/admin';

import type { LeadItemProps } from '@/components/admin/LeadCard';

function formatLeadTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function LeadTableRow({ lead, admins = [], onStatus, onAssignee, onEdit, onNotes, onDelete }: LeadItemProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);

  return (
    <tr className="border-t border-line even:bg-base/40 hover:bg-surface-raised">
      <td className="whitespace-nowrap px-3 py-2.5 align-top">
        <p className="text-ink">{formatLeadDate(lead.createdAt)}</p>
        <p className="text-xs text-ink-muted">{formatLeadTime(lead.createdAt)}</p>
      </td>
      <td className="max-w-[10rem] px-3 py-2.5 align-top font-medium text-ink">{lead.name}</td>
      <td className="max-w-[14rem] px-3 py-2.5 align-top">
        <a href={`mailto:${lead.email}`} className="break-all text-accent-soft hover:text-ink">
          {lead.email}
        </a>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-ink">{APP_LABELS[lead.appId]}</td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-ink-muted">{LEAD_SOURCE_LABELS[lead.source]}</td>
      <td className="min-w-[16rem] max-w-[28rem] px-3 py-2.5 align-top text-ink">{lead.summary}</td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top">
        {onStatus ? (
          <LeadStatusSelect leadId={lead.leadId} name={lead.name} status={lead.status} onStatus={onStatus} />
        ) : (
          <LeadStatusBadge status={lead.status} />
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top">
        {onAssignee ? (
          <LeadAssigneeSelect
            leadId={lead.leadId}
            name={lead.name}
            assigneeId={lead.assigneeId}
            assigneeName={lead.assigneeName}
            admins={admins}
            onAssignee={onAssignee}
          />
        ) : (
          <span className="text-sm text-ink">{leadAssigneeLabel(lead, admins)}</span>
        )}
      </td>
      {canManage && onEdit && onNotes && onDelete ? (
        <td className="whitespace-nowrap px-3 py-2.5 align-top">
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} />
        </td>
      ) : null}
    </tr>
  );
}
