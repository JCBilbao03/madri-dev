import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/admin';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'border-accent/40 bg-accent/10 text-accent-soft',
  contacted: 'border-line bg-surface-raised text-ink-muted',
  qualified: 'border-accent-alt/40 bg-accent-alt/10 text-accent-alt',
  closed: 'border-line bg-base text-ink-muted',
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
