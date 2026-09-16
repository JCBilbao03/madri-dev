import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { ValidationIssue } from '@/types/operations';
import { cn } from '@/lib/utils';

interface ValidationIssueListProps {
  issues: ValidationIssue[];
  className?: string;
}

export function ValidationIssueList({ issues, className }: ValidationIssueListProps) {
  if (issues.length === 0) {
    return (
      <div className={cn('inventory-panel flex items-center gap-2 px-4 py-3', className)}>
        <CheckCircle2 className="size-4 text-[color:var(--inv-scan)]" aria-hidden="true" />
        <p className="text-sm text-ink">All checks passed — ready to generate ASN.</p>
      </div>
    );
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {issues.map((issue, index) => (
        <li
          key={`${issue.code}-${issue.productId ?? index}`}
          className={cn(
            'inventory-panel flex items-start gap-2.5 px-4 py-3',
            issue.severity === 'error' ? 'border-danger/30' : 'border-amber-500/30',
          )}
        >
          {issue.severity === 'error' ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm text-ink">{issue.message}</p>
            <p className="mt-0.5 font-display text-[10px] tracking-[0.14em] text-ink-muted uppercase">
              {issue.severity} · {issue.code}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
