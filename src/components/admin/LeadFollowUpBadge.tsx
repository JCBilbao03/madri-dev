import { followUpLabel, followUpTone } from '@/lib/leadFollowUp';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/admin';

interface LeadFollowUpBadgeProps {
  followUpAt: string;
  status: LeadStatus;
  className?: string;
}

export function LeadFollowUpBadge({ followUpAt, status, className }: LeadFollowUpBadgeProps) {
  const tone = followUpTone(followUpAt, status);

  if (tone === 'none') {
    return null;
  }

  return (
    <span className={cn('text-xs', tone === 'due' ? 'text-danger' : 'text-ink-muted', className)}>
      {followUpLabel(followUpAt)}
    </span>
  );
}
