import { AdminStatusDot } from '@/components/admin/AdminStatusDot';
import type { LeadStatus } from '@/types/admin';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return <AdminStatusDot status={status} />;
}
