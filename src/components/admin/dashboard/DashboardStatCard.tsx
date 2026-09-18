import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
  tone?: 'default' | 'accent' | 'danger' | 'success';
  icon?: LucideIcon;
}

const TONE_STYLES = {
  default: 'border-line/80',
  accent: 'border-accent/35 bg-accent/5',
  danger: 'border-danger/35 bg-danger/5',
  success: 'border-emerald-500/30 bg-emerald-500/5',
} as const;

export function DashboardStatCard({
  label,
  value,
  hint,
  to,
  tone = 'default',
  icon: Icon,
}: DashboardStatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        {Icon ? <Icon className="size-4 shrink-0 text-ink-muted/80" aria-hidden="true" /> : null}
      </div>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-semibold tabular-nums',
          tone === 'danger' && Number(value) > 0 ? 'text-danger' : 'text-ink',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </>
  );

  const className = cn(
    'rounded-2xl border px-5 py-5 transition',
    TONE_STYLES[tone],
    to && 'hover:border-line hover:shadow-sm hover:shadow-ink/5',
  );

  if (to) {
    return (
      <Link to={to} className={cn(className, 'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent')}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
