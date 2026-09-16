import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ProductAttentionBanner } from '@/components/operations/ProductAttentionBanner';
import {
  OpsStatusBadge,
  barcodeStatusTone,
  shopifySyncTone,
} from '@/components/operations/OpsStatusBadge';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { countProductsRequiringAttention } from '@/lib/operationsMetrics';
import { filterInventoryItems } from '@/lib/inventory';
import { useInventoryStore } from '@/store/useInventoryStore';
import type { InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

type ProductFilter = 'all' | 'missing' | 'unverified' | 'sync_pending';

const FILTERS: { id: ProductFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'missing', label: 'Missing' },
  { id: 'unverified', label: 'Needs verification' },
  { id: 'sync_pending', label: 'Shopify sync pending' },
];

function applyProductFilter(items: InventoryItem[], filter: ProductFilter): InventoryItem[] {
  switch (filter) {
    case 'missing':
      return items.filter((item) => item.barcodeStatus === 'missing' || !item.barcode.trim());
    case 'unverified':
      return items.filter((item) => item.barcode.trim() && item.barcodeStatus !== 'verified');
    case 'sync_pending':
      return items.filter((item) => item.shopifySyncStatus === 'pending');
    default:
      return items;
  }
}

function barcodeStatusLabel(status: string): string {
  if (status === 'verified') return 'Verified';
  if (status === 'ready') return 'Ready';
  return 'Missing';
}

export function ProductBarcodePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') as ProductFilter | null;
  const activeFilter: ProductFilter =
    filterParam && FILTERS.some((entry) => entry.id === filterParam) ? filterParam : 'all';

  const items = useInventoryStore((state) => state.items);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const error = useInventoryStore((state) => state.error);
  const hydrate = useInventoryStore((state) => state.hydrate);

  const [query, setQuery] = useState('');

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const attentionCount = useMemo(() => countProductsRequiringAttention(items), [items]);

  const visible = useMemo(() => {
    const filtered = applyProductFilter(items, activeFilter);
    return filterInventoryItems(filtered, query);
  }, [activeFilter, items, query]);

  const setFilter = useCallback(
    (filter: ProductFilter) => {
      if (filter === 'all') {
        setSearchParams({});
        return;
      }
      setSearchParams({ filter });
    },
    [setSearchParams],
  );

  return (
    <InventoryPage className="min-h-full">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            Product & barcode manager
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            SKU & barcode workflow
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 sm:text-base">
            Generate barcodes, verify labels, and sync to Shopify — all simulated for demo.
          </p>
        </div>
        <Button to="/inventory-app/products/items/new" variant="primary" className="self-start lg:self-auto">
          Add product
        </Button>
      </header>

      <div className="mt-6">
        <ProductAttentionBanner count={attentionCount} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={cn(
              'min-h-11 rounded-md border px-3 py-2 font-display text-[11px] tracking-[0.14em] uppercase transition-colors',
              activeFilter === entry.id
                ? 'border-[color:var(--inv-scan)]/50 text-[color:var(--inv-scan)]'
                : 'border-line text-ink-muted hover:border-[color:var(--inv-scan)]/30',
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <label className="relative mt-6 block">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--inv-scan)]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, SKU, or barcode…"
          className="inventory-input pl-10"
        />
      </label>

      {isLoading ? (
        <div className="mt-8">
          <InventoryLoadingState />
        </div>
      ) : error ? (
        <p className="inventory-panel mt-8 px-4 py-4 text-sm text-danger">{error}</p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="inventory-panel w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Shopify</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/inventory-app/products/items/${item.id}`}
                        className="font-medium text-ink hover:text-[color:var(--inv-scan)]"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-display text-ink-muted">{item.sku}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.barcode || '—'}</td>
                    <td className="px-4 py-3">
                      <OpsStatusBadge
                        label={barcodeStatusLabel(item.barcodeStatus)}
                        tone={barcodeStatusTone(item.barcodeStatus)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <OpsStatusBadge label={item.shopifySyncStatus} tone={shopifySyncTone(item.shopifySyncStatus)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-3 md:hidden">
            {visible.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/inventory-app/products/items/${item.id}`}
                  className="inventory-panel block px-4 py-4 transition-colors hover:border-[color:var(--inv-scan)]/40"
                >
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="mt-1 font-display text-xs text-ink-muted">{item.sku}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OpsStatusBadge
                      label={barcodeStatusLabel(item.barcodeStatus)}
                      tone={barcodeStatusTone(item.barcodeStatus)}
                    />
                    <OpsStatusBadge label={item.shopifySyncStatus} tone={shopifySyncTone(item.shopifySyncStatus)} />
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink-muted">{item.barcode || 'No barcode'}</p>
                </Link>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="inventory-panel mt-6 px-4 py-6 text-center text-sm text-ink-muted">
              No products match this filter.
            </p>
          ) : null}
        </>
      )}
    </InventoryPage>
  );
}
