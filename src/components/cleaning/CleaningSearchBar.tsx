import { Search } from 'lucide-react';
import { useCallback, type ChangeEvent, type FormEvent } from 'react';

import { cn } from '@/lib/utils';
import { CLEANING_SERVICES, type CleaningService } from '@/types/cleaning';

interface CleaningSearchBarProps {
  query: string;
  service: CleaningService | '';
  resultCount: number;
  onQueryChange: (value: string) => void;
  onServiceChange: (value: CleaningService | '') => void;
}

interface ServiceChipProps {
  label: string;
  value: CleaningService | '';
  isActive: boolean;
  onSelect: (value: CleaningService | '') => void;
}

function ServiceChip({ label, value, isActive, onSelect }: ServiceChipProps) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={cn(
        'rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-150 min-h-11',
        isActive
          ? 'border-accent/50 bg-accent/15 text-accent-soft'
          : 'border-line bg-surface text-ink-muted hover:border-accent/40 hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

export function CleaningSearchBar({
  query,
  service,
  resultCount,
  onQueryChange,
  onServiceChange,
}: CleaningSearchBarProps) {
  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange],
  );

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <label htmlFor="cleaning-search" className="mb-2 block text-sm font-medium text-ink">
          Search by location or service
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            id="cleaning-search"
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Austin, Brooklyn, deep clean…"
            className="w-full rounded-xl border border-line bg-surface py-3 pr-4 pl-10 text-base text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <ServiceChip label="All services" value="" isActive={service === ''} onSelect={onServiceChange} />
        {CLEANING_SERVICES.map((item) => (
          <ServiceChip key={item} label={item} value={item} isActive={service === item} onSelect={onServiceChange} />
        ))}
        <p className="ml-auto text-sm text-ink-muted">
          {resultCount === 1 ? '1 cleaner' : `${resultCount} cleaners`}
        </p>
      </div>
    </div>
  );
}
