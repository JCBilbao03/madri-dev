import { useCallback } from 'react';

import { cn } from '@/lib/utils';

interface FilterChipProps<T extends string> {
  id: T;
  label: string;
  isActive: boolean;
  onSelect: (id: T) => void;
  className?: string;
}

export function FilterChip<T extends string>({ id, label, isActive, onSelect, className }: FilterChipProps<T>) {
  const handleClick = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={cn(
        'rounded-full px-3 py-2 text-sm font-medium capitalize transition touch-manipulation sm:py-1.5',
        isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink',
        className,
      )}
    >
      {label}
    </button>
  );
}
