import { useCallback, type ChangeEvent } from 'react';

import { cn } from '@/lib/utils';
import type { LeadAdminOption } from '@/types/admin';

interface LeadAssigneeSelectProps {
  leadId: string;
  name: string;
  assigneeId: string;
  assigneeName: string;
  admins: LeadAdminOption[];
  onAssignee: (leadId: string, assigneeId: string) => void | Promise<void>;
  className?: string;
}

export function LeadAssigneeSelect({
  leadId,
  name,
  assigneeId,
  assigneeName,
  admins,
  onAssignee,
  className,
}: LeadAssigneeSelectProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      void onAssignee(leadId, event.target.value);
    },
    [leadId, onAssignee],
  );

  const hasCurrent = assigneeId.length > 0 && !admins.some((admin) => admin.uid === assigneeId);

  return (
    <select
      aria-label={`Assignee for ${name}`}
      value={assigneeId}
      onChange={handleChange}
      className={cn(
        'h-8 w-full min-w-[8.75rem] rounded-md border border-line bg-base px-2 text-xs font-medium text-ink',
        'focus:border-accent focus:outline-none',
        className,
      )}
    >
      <option value="">Unassigned</option>
      {hasCurrent ? <option value={assigneeId}>{assigneeName.trim() || 'Assigned'}</option> : null}
      {admins.map((admin) => (
        <option key={admin.uid} value={admin.uid}>
          {admin.name}
        </option>
      ))}
    </select>
  );
}
