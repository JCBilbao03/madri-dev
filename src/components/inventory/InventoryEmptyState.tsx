import { ScanSearch } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';

interface InventoryEmptyStateProps {
  query?: string;
  onClearQuery?: () => void;
}

export function InventoryEmptyState({ query = '', onClearQuery }: InventoryEmptyStateProps) {
  const searching = query.trim().length > 0;

  return (
    <InventoryPanel className="px-6 py-14 text-center sm:px-10">
      <div className="mx-auto grid size-12 place-items-center border border-[color:var(--inv-scan)]/40 text-[color:var(--inv-scan)]">
        <ScanSearch className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-6 font-display text-lg font-medium tracking-tight text-ink">
        {searching ? 'No SKUs in this scan' : 'Catalog is empty'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {searching
          ? `Nothing matched “${query.trim()}”. Try a SKU, product name, or barcode value.`
          : 'Register a product with a photo and SKU. Barcode and QR codes generate the moment you save.'}
      </p>
      {searching ? (
        <Button type="button" variant="secondary" className="mt-6" onClick={onClearQuery}>
          Clear query
        </Button>
      ) : (
        <Button to="/inventory-app/items/new" variant="primary" className="mt-6">
          Initialize first SKU
        </Button>
      )}
    </InventoryPanel>
  );
}
