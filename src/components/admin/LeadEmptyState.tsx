interface LeadEmptyStateProps {
  filtered?: boolean;
  onClearFilters?: () => void;
  onAddLead?: () => void;
}

export function LeadEmptyState({ filtered = false, onClearFilters, onAddLead }: LeadEmptyStateProps) {
  return (
    <div className="py-16 text-center text-sm text-ink-muted">
      <p>{filtered ? 'No leads match these filters.' : 'No leads yet.'}</p>
      {filtered && onClearFilters ? (
        <button type="button" onClick={onClearFilters} className="mt-3 text-ink hover:underline">
          Clear filters
        </button>
      ) : null}
      {!filtered && onAddLead ? (
        <button type="button" onClick={onAddLead} className="mt-3 text-ink hover:underline">
          Add lead
        </button>
      ) : null}
    </div>
  );
}
