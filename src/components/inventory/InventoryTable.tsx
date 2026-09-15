import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { InventoryEmptyState } from '@/components/inventory/InventoryEmptyState';
import { InventoryProductCard } from '@/components/inventory/InventoryProductCard';
import { formatDimensions, type InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryTableProps {
  items: InventoryItem[];
  selectedIds: string[];
  query: string;
  onClearQuery?: () => void;
  onToggleSelected: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
}

function stockTone(stock: number): string {
  if (stock === 0) {
    return 'text-danger';
  }
  if (stock < 10) {
    return 'text-accent-soft';
  }
  return 'text-[color:var(--inv-scan)]';
}

export function InventoryTable({
  items,
  selectedIds,
  query,
  onClearQuery,
  onToggleSelected,
  onSelectAll,
  onClearSelection,
}: InventoryTableProps) {
  const prefersReducedMotion = useReducedMotion();
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
      return;
    }
    onSelectAll(items.map((item) => item.id));
  };

  if (items.length === 0) {
    return <InventoryEmptyState query={query} onClearQuery={onClearQuery} />;
  }

  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {items.map((item, index) => (
          <li key={item.id}>
            <InventoryProductCard
              item={item}
              selected={selectedIds.includes(item.id)}
              onToggleSelected={onToggleSelected}
              index={index}
            />
          </li>
        ))}
      </ul>

      <div className="inventory-panel hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-raised/40 font-display text-[10px] tracking-[0.18em] text-ink-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all products"
                    className="size-4 rounded-sm border-line accent-[color:var(--inv-scan)]"
                  />
                </th>
                <th scope="col" className="px-4 py-3">
                  Asset
                </th>
                <th scope="col" className="px-4 py-3">
                  SKU
                </th>
                <th scope="col" className="px-4 py-3">
                  Stock
                </th>
                <th scope="col" className="px-4 py-3">
                  Envelope
                </th>
                <th scope="col" className="px-4 py-3">
                  Mass
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const selected = selectedIds.includes(item.id);

                return (
                  <motion.tr
                    key={item.id}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
                    className={cn(
                      'border-b border-line/70 last:border-b-0 transition-colors duration-150 hover:bg-surface-raised/50',
                      selected && 'bg-[color:var(--inv-scan)]/6',
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelected(item.id)}
                        aria-label={`Select ${item.name}`}
                        className="size-4 rounded-sm border-line accent-[color:var(--inv-scan)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt="" className="size-11 object-cover" />
                        ) : (
                          <div className="size-11 border border-dashed border-line bg-base" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{item.name}</p>
                          <p className="font-display text-[11px] tracking-wide text-ink-muted">{item.barcodeValue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-display text-ink-muted">{item.sku}</td>
                    <td className={cn('px-4 py-3 font-display tabular-nums', stockTone(item.stock))}>{item.stock}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDimensions(item.dimensions)}</td>
                    <td className="px-4 py-3 font-display tabular-nums text-ink-muted">{item.weightKg} kg</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/inventory-app/items/${item.id}`}
                        className="inline-flex min-h-11 items-center font-display text-[11px] tracking-[0.14em] text-[color:var(--inv-scan-muted)] uppercase transition-colors hover:text-ink"
                      >
                        Open
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
