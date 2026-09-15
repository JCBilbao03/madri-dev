import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface InventoryFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  layout?: 'stack' | 'inline';
}

export function InventoryField({
  label,
  hint,
  className,
  id,
  layout = 'stack',
  ...props
}: InventoryFieldProps) {
  const fieldId = id ?? props.name;
  const labelEl = (
    <span className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">{label}</span>
  );

  if (layout === 'inline') {
    return (
      <label htmlFor={fieldId} className="flex items-center justify-between gap-4">
        {labelEl}
        <input id={fieldId} className={cn('inventory-input max-w-xs shrink-0', className)} {...props} />
        {hint ? <span className="w-full text-xs text-ink-muted">{hint}</span> : null}
      </label>
    );
  }

  return (
    <label htmlFor={fieldId} className="block space-y-2">
      {labelEl}
      <input id={fieldId} className={cn('inventory-input', className)} {...props} />
      {hint ? <span className="block text-xs text-ink-muted">{hint}</span> : null}
    </label>
  );
}
