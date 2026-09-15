import { ChevronDown, Download } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { exportInventory, type InventoryExportFormat } from '@/lib/inventory';
import type { InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  items: InventoryItem[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

const formats: { value: InventoryExportFormat; label: string }[] = [
  { value: 'xlsx', label: 'Excel · XLSX' },
  { value: 'csv', label: 'Comma · CSV' },
];

export function ExportMenu({ items, label = 'Export', disabled = false, className }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(
    (format: InventoryExportFormat) => {
      exportInventory(items, format);
      setOpen(false);
    },
    [items],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || items.length === 0}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download className="size-4" aria-hidden="true" />
        {label}
        <ChevronDown className={cn('size-4 transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </Button>

      {open ? (
        <div
          role="menu"
          className="inventory-panel absolute top-full right-0 z-20 mt-2 min-w-48 overflow-hidden"
        >
          {formats.map((format) => (
            <button
              key={format.value}
              type="button"
              role="menuitem"
              className="block min-h-11 w-full px-4 py-2.5 text-left font-display text-xs tracking-wide text-ink uppercase transition-colors hover:bg-surface-raised"
              onClick={() => handleExport(format.value)}
            >
              {format.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
