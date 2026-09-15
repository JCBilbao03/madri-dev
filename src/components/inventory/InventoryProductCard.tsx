import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { formatDimensions, type InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryProductCardProps {
  item: InventoryItem;
  selected: boolean;
  onToggleSelected: (id: string) => void;
  index: number;
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

export function InventoryProductCard({ item, selected, onToggleSelected, index }: InventoryProductCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <InventoryPanel className={cn('p-4 transition-colors duration-150', selected && 'bg-surface-raised/80')}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelected(item.id)}
            aria-label={`Select ${item.name}`}
            className="mt-1 size-5 shrink-0 rounded-sm border-line accent-[color:var(--inv-scan)]"
          />
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" className="size-16 shrink-0 object-cover" />
          ) : (
            <div className="grid size-16 shrink-0 place-items-center border border-dashed border-line font-display text-[9px] tracking-widest text-ink-muted uppercase">
              No img
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link to={`/inventory-app/items/${item.id}`} className="block font-medium text-ink hover:text-[color:var(--inv-scan)]">
              {item.name}
            </Link>
            <p className="mt-1 font-display text-xs tracking-wide text-ink-muted">{item.sku}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-ink-muted">Stock</dt>
                <dd className={cn('mt-0.5 font-display tabular-nums', stockTone(item.stock))}>{item.stock}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Weight</dt>
                <dd className="mt-0.5 tabular-nums text-ink">{item.weightKg} kg</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-muted">Dims</dt>
                <dd className="mt-0.5 text-ink">{formatDimensions(item.dimensions)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </InventoryPanel>
    </motion.article>
  );
}
