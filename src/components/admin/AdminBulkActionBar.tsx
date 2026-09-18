import { Mail, Trash2, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

import { cn } from '@/lib/utils';
import { LEAD_STATUSES, type LeadStatus } from '@/types/admin';

interface AdminBulkActionBarProps {
  selectedCount: number;
  onUnselectAll: () => void;
  onChangeStatus: (status: LeadStatus) => void;
  onNewMail: () => void;
  onDelete: () => void;
  className?: string;
}

export function AdminBulkActionBar({
  selectedCount,
  onUnselectAll,
  onChangeStatus,
  onNewMail,
  onDelete,
  className,
}: AdminBulkActionBarProps) {
  const selectId = useId();
  const [status, setStatus] = useState<LeadStatus>('contacted');

  const handleStatusApply = useCallback(() => {
    onChangeStatus(status);
  }, [onChangeStatus, status]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-line bg-surface-raised/60 px-4 py-2.5 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium text-ink">
        {selectedCount} selected
      </span>

      <button
        type="button"
        onClick={onUnselectAll}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-muted transition hover:bg-surface hover:text-ink"
      >
        <X className="size-3.5" aria-hidden="true" />
        Unselect all
      </button>

      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={selectId} className="sr-only">
          Change status for selected leads
        </label>
        <select
          id={selectId}
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadStatus)}
          className="h-9 rounded-lg border border-line bg-base px-2.5 text-sm text-ink"
        >
          {LEAD_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {entry.charAt(0).toUpperCase() + entry.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleStatusApply}
          className="h-9 rounded-lg border border-line bg-base px-3 text-sm font-medium text-ink transition hover:bg-surface-raised"
        >
          Change status
        </button>

        <button
          type="button"
          onClick={onNewMail}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-base px-3 text-sm font-medium text-ink transition hover:bg-surface-raised"
        >
          <Mail className="size-4" aria-hidden="true" />
          New mail
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/5 px-3 text-sm font-medium text-danger transition hover:bg-danger/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </div>
  );
}
