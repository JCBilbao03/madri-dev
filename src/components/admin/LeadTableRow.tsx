import { useCallback, type MouseEvent } from 'react';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import { AdminStatusDot } from '@/components/admin/AdminStatusDot';
import { LeadFollowUpBadge } from '@/components/admin/LeadFollowUpBadge';
import { LeadRowActions } from '@/components/admin/LeadRowActions';
import { isFollowUpDue } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';
import { formatLeadDate, formatLeadSource, leadAssigneeLabel } from '@/types/admin';

import type { LeadItemProps } from '@/components/admin/LeadCard';

function isRowControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [role="menu"], [role="menuitem"], [aria-haspopup="menu"], [data-lead-row-actions]',
    ),
  );
}

interface LeadTableRowProps extends LeadItemProps {
  compact?: boolean;
  selected?: boolean;
  onSelect?: (leadId: string, selected: boolean) => void;
}

export function LeadTableRow({
  lead,
  admins = [],
  compact = false,
  selected = false,
  onSelect,
  onEdit,
  onNotes,
  onDelete,
}: LeadTableRowProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);
  const isDue = isFollowUpDue(lead.followUpAt, lead.status);
  const ownerLabel = leadAssigneeLabel(lead, admins);

  const handleSelectChange = () => {
    onSelect?.(lead.leadId, !selected);
  };

  const interactive = Boolean(onEdit);

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLTableRowElement>) => {
      if (!onEdit || isRowControlTarget(event.target)) {
        return;
      }

      onEdit(lead);
    },
    [lead, onEdit],
  );

  return (
    <tr
      onClick={interactive ? handleRowClick : undefined}
      className={cn(
        'border-t border-line transition-colors hover:bg-surface-raised/40',
        interactive && 'cursor-pointer',
        isDue && 'bg-danger/[0.03]',
        selected && 'bg-accent/[0.04]',
      )}
    >
      {onSelect ? (
        <td className="w-10 px-3 py-3 align-middle" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelectChange}
            aria-label={`Select ${lead.name}`}
            className="size-4 rounded border-line text-accent focus:ring-accent"
          />
        </td>
      ) : null}

      <td className="max-w-[14rem] px-3 py-3 align-middle">
        <div className="min-w-0">
          <p className="truncate text-ink">{lead.name}</p>
          <LeadFollowUpBadge followUpAt={lead.followUpAt} status={lead.status} className="mt-0.5 block" />
        </div>
      </td>

      {!compact ? (
        <>
          <td className="whitespace-nowrap px-3 py-3 align-middle">
            <div className="flex items-center gap-2">
              {ownerLabel !== 'Unassigned' ? (
                <AdminAvatar name={ownerLabel} size="sm" />
              ) : null}
              <span className="text-sm text-ink-muted">{ownerLabel}</span>
            </div>
          </td>
          <td className="whitespace-nowrap px-3 py-3 align-middle text-sm text-ink-muted">
            {formatLeadSource(lead)}
          </td>
        </>
      ) : null}

      <td className="whitespace-nowrap px-3 py-3 align-middle">
        <AdminStatusDot status={lead.status} />
      </td>

      <td className="whitespace-nowrap px-3 py-3 align-middle text-sm text-ink-muted">
        {formatLeadDate(lead.createdAt)}
      </td>

      {canManage && onEdit && onNotes && onDelete ? (
        <td
          className="whitespace-nowrap px-3 py-3 align-middle"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <LeadRowActions lead={lead} onEdit={onEdit} onNotes={onNotes} onDelete={onDelete} />
        </td>
      ) : null}
    </tr>
  );
}
