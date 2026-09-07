import { useCallback, type ChangeEvent } from 'react';

import { cn } from '@/lib/utils';
import { isLeadStatus, LEAD_STATUSES, type LeadStatus } from '@/types/admin';

interface LeadStatusSelectProps {
  leadId: string;
  name: string;
  status: LeadStatus;
  onStatus: (leadId: string, status: LeadStatus) => void | Promise<void>;
  className?: string;
}

export function LeadStatusSelect({ leadId, name, status, onStatus, className }: LeadStatusSelectProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (isLeadStatus(event.target.value)) {
        void onStatus(leadId, event.target.value);
      }
    },
    [leadId, onStatus],
  );

  return (
    <select
      aria-label={`Status for ${name}`}
      value={status}
      onChange={handleChange}
      className={cn(
        'h-8 w-full min-w-[8.75rem] rounded-md border border-line bg-base px-2 text-xs font-medium capitalize text-ink',
        'focus:border-accent focus:outline-none',
        className,
      )}
    >
      {LEAD_STATUSES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
