import { cn } from '@/lib/utils';

type OpsStatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface OpsStatusBadgeProps {
  label: string;
  tone?: OpsStatusTone;
  className?: string;
}

const TONE_STYLES: Record<OpsStatusTone, string> = {
  neutral: 'border-line bg-surface-raised text-ink-muted',
  success: 'border-[color:var(--inv-scan)]/40 bg-[color:var(--inv-scan)]/10 text-[color:var(--inv-scan)]',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  info: 'border-accent/40 bg-accent/10 text-accent-soft',
};

export function OpsStatusBadge({ label, tone = 'neutral', className }: OpsStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE_STYLES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function barcodeStatusTone(status: string): OpsStatusTone {
  if (status === 'verified') return 'success';
  if (status === 'ready') return 'info';
  return 'danger';
}

export function asnStatusTone(status: string): OpsStatusTone {
  if (status === 'submitted') return 'success';
  if (status === 'generated') return 'info';
  if (status === 'validated') return 'warning';
  return 'neutral';
}

export function claimStatusTone(status: string): OpsStatusTone {
  if (status === 'closed' || status === 'refunded') return 'success';
  if (status === 'approved') return 'info';
  if (status === 'waiting_3pl') return 'warning';
  if (status === 'new') return 'danger';
  return 'neutral';
}

export function shopifySyncTone(status: string): OpsStatusTone {
  if (status === 'synced') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'error') return 'danger';
  return 'neutral';
}
