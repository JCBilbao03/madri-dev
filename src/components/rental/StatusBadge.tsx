import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/rental';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: 'border-line bg-surface-raised text-ink-muted',
  reviewing: 'border-accent/40 bg-accent/10 text-accent-soft',
  accepted: 'border-accent-alt/40 bg-accent-alt/10 text-accent-alt',
  declined: 'border-danger/40 bg-danger/10 text-danger',
  withdrawn: 'border-line bg-base text-ink-muted',
};

export function StatusBadge({ status }: StatusBadgeProps) {
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
