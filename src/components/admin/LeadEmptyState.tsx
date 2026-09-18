import { FileUp, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface LeadEmptyStateProps {
  filtered?: boolean;
  onClearFilters?: () => void;
  onAddLead?: () => void;
  onImport?: () => void;
}

export function LeadEmptyState({
  filtered = false,
  onClearFilters,
  onAddLead,
  onImport,
}: LeadEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-dashed border-line bg-surface-raised text-ink-muted">
        <Users className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-sm font-medium text-ink">
        {filtered ? 'No leads match these filters' : 'No leads yet'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">
        {filtered
          ? 'Try clearing filters or broadening your search.'
          : 'Add a lead manually or import an Excel list to start outreach.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {filtered && onClearFilters ? (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : null}
        {!filtered && onImport ? (
          <Button variant="secondary" size="sm" onClick={onImport}>
            <FileUp className="size-4" aria-hidden="true" />
            Import Excel
          </Button>
        ) : null}
        {!filtered && onAddLead ? (
          <Button size="sm" onClick={onAddLead}>
            <UserPlus className="size-4" aria-hidden="true" />
            Add lead
          </Button>
        ) : null}
      </div>
    </div>
  );
}
