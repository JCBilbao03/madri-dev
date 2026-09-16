import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ActionRequiredItem } from '@/lib/operationsMetrics';
import { cn } from '@/lib/utils';

interface ActionRequiredListProps {
  items: ActionRequiredItem[];
  className?: string;
}

const PRIORITY_STYLES: Record<ActionRequiredItem['priority'], string> = {
  high: 'border-danger/30 bg-danger/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-line bg-surface-raised/50',
};

export function ActionRequiredList({ items, className }: ActionRequiredListProps) {
  if (items.length === 0) {
    return (
      <div className={cn('inventory-panel px-4 py-6 text-center', className)}>
        <p className="text-sm text-ink-muted">No urgent actions — operations are on track.</p>
      </div>
    );
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={item.href}
            className={cn(
              'inventory-panel flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition-colors hover:border-[color:var(--inv-scan)]/40',
              PRIORITY_STYLES[item.priority],
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <AlertTriangle
                className={cn(
                  'size-4 shrink-0',
                  item.priority === 'high' ? 'text-danger' : 'text-amber-600 dark:text-amber-400',
                )}
                aria-hidden="true"
              />
              <span className="text-sm text-ink">{item.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 font-display text-[11px] tracking-[0.14em] text-[color:var(--inv-scan)] uppercase">
              Fix now
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
