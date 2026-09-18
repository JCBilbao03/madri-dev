import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/admin';
import type { UserRole } from '@/types/rental';

type StatusVariant = LeadStatus | UserRole;

interface AdminStatusDotProps {
  status: StatusVariant;
  className?: string;
}

const STATUS_STYLES: Record<StatusVariant, { dot: string; label: string }> = {
  new: { dot: 'bg-emerald-500', label: 'New' },
  contacted: { dot: 'bg-sky-500', label: 'Contacted' },
  qualified: { dot: 'bg-amber-500', label: 'Qualified' },
  closed: { dot: 'bg-zinc-400', label: 'Closed' },
  tenant: { dot: 'bg-sky-500', label: 'Tenant' },
  landlord: { dot: 'bg-violet-500', label: 'Landlord' },
  admin: { dot: 'bg-emerald-500', label: 'Admin' },
};

function formatLabel(status: StatusVariant): string {
  return STATUS_STYLES[status]?.label ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export function AdminStatusDot({ status, className }: AdminStatusDotProps) {
  const styles = STATUS_STYLES[status] ?? { dot: 'bg-zinc-400', label: formatLabel(status) };

  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-ink', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', styles.dot)} aria-hidden="true" />
      <span className="capitalize">{styles.label}</span>
    </span>
  );
}
