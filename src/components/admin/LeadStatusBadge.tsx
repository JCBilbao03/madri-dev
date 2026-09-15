import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/admin';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span className={cn('text-xs capitalize text-ink-muted', status === 'new' && 'text-ink')}>
      {status}
    </span>
  );
}
