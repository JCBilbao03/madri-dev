import { Search } from 'lucide-react';
import { useCallback, type ChangeEvent } from 'react';

import { cn } from '@/lib/utils';
import { isListingSort, LISTING_AREAS, type ListingSort } from '@/types/rental';

interface ListingFiltersProps {
  search: string;
  maxPrice: string;
  areaId: string;
  sort: ListingSort;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onSortChange: (value: ListingSort) => void;
}

interface AreaChipProps {
  id: string;
  label: string;
  isActive: boolean;
  onSelect: (id: string) => void;
}

function AreaChip({ id, label, isActive, onSelect }: AreaChipProps) {
  const handleClick = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition',
        isActive
          ? 'border-accent/50 bg-accent/15 text-accent-soft'
          : 'border-line bg-surface text-ink-muted hover:border-accent/40 hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

export function ListingFilters({
  search,
  maxPrice,
  areaId,
  sort,
  resultCount,
  onSearchChange,
  onMaxPriceChange,
  onAreaChange,
  onSortChange,
}: ListingFiltersProps) {
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange],
  );

  const handleMaxPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onMaxPriceChange(event.target.value);
    },
    [onMaxPriceChange],
  );

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (isListingSort(event.target.value)) {
        onSortChange(event.target.value);
      }
    },
    [onSortChange],
  );

  return (
    <div className="mt-8 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_12rem_12rem] sm:items-end">
        <div>
          <label htmlFor="listing-search" className="mb-2 block text-sm font-medium text-ink">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              id="listing-search"
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Austin, Brooklyn, townhouse…"
              className="w-full rounded-xl border border-line bg-surface py-3 pr-4 pl-10 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="listing-max-price" className="mb-2 block text-sm font-medium text-ink">
            Max rent (USD)
          </label>
          <input
            id="listing-max-price"
            type="number"
            min={0}
            step={100}
            value={maxPrice}
            onChange={handleMaxPriceChange}
            placeholder="Any"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="listing-sort" className="mb-2 block text-sm font-medium text-ink">
            Sort
          </label>
          <select
            id="listing-sort"
            value={sort}
            onChange={handleSortChange}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {LISTING_AREAS.map((area) => (
          <AreaChip
            key={area.id || 'all'}
            id={area.id}
            label={area.label}
            isActive={areaId === area.id}
            onSelect={onAreaChange}
          />
        ))}
        <p className="ml-auto text-sm text-ink-muted">
          {resultCount === 1 ? '1 listing' : `${resultCount} listings`}
        </p>
      </div>
    </div>
  );
}
