import { Boxes, Layers3, ScanLine, SquareCheck } from 'lucide-react';
import { useMemo } from 'react';

import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import type { InventoryItem } from '@/types/inventory';

interface InventoryStatStripProps {
  items: InventoryItem[];
  selectedCount: number;
}

export function InventoryStatStrip({ items, selectedCount }: InventoryStatStripProps) {
  const units = useMemo(() => items.reduce((sum, item) => sum + item.stock, 0), [items]);
  const lowStock = useMemo(() => items.filter((item) => item.stock > 0 && item.stock < 10).length, [items]);

  const stats = [
    { label: 'SKUs', value: items.length, icon: Layers3 },
    { label: 'Units on hand', value: units, icon: Boxes },
    { label: 'Low stock', value: lowStock, icon: ScanLine },
    { label: 'Selected', value: selectedCount, icon: SquareCheck },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label}>
          <InventoryPanel className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-[10px] tracking-[0.18em] text-ink-muted uppercase">{stat.label}</p>
              <stat.icon className="size-3.5 text-[color:var(--inv-scan)]" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-medium tracking-tight tabular-nums text-ink">{stat.value}</p>
          </InventoryPanel>
        </li>
      ))}
    </ul>
  );
}
