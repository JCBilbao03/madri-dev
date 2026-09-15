import { Printer, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ExportMenu } from '@/components/inventory/ExportMenu';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryStatStrip } from '@/components/inventory/InventoryStatStrip';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { LabelSheet } from '@/components/inventory/LabelSheet';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { filterInventoryItems } from '@/lib/inventory';
import { useInventoryStore } from '@/store/useInventoryStore';

export function InventoryCatalogPage() {
  const items = useInventoryStore((state) => state.items);
  const selectedIds = useInventoryStore((state) => state.selectedIds);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const error = useInventoryStore((state) => state.error);
  const hydrate = useInventoryStore((state) => state.hydrate);
  const toggleSelected = useInventoryStore((state) => state.toggleSelected);
  const selectAll = useInventoryStore((state) => state.selectAll);
  const clearSelection = useInventoryStore((state) => state.clearSelection);

  const [query, setQuery] = useState('');

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const resetPrintMode = () => {
      delete document.body.dataset.printMode;
    };

    window.addEventListener('afterprint', resetPrintMode);
    return () => window.removeEventListener('afterprint', resetPrintMode);
  }, []);

  const visible = useMemo(() => filterInventoryItems(items, query), [items, query]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const exportItems = selectedItems.length > 0 ? selectedItems : visible;
  const exportLabel = selectedItems.length > 0 ? `Export ${selectedItems.length}` : 'Export';
  const printLabelsLabel =
    selectedItems.length > 0 ? `Print ${selectedItems.length} labels` : 'Print labels';

  const handlePrintLabels = useCallback(() => {
    if (selectedItems.length === 0) {
      return;
    }

    document.body.dataset.printMode = 'labels';
    window.print();
  }, [selectedItems.length]);

  return (
    <InventoryPage className="min-h-full">
        <div className="inventory-catalog-content">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
              Node 01 // warehouse
            </p>
            <h1
              id="inventory-catalog-heading"
              className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
            >
              Catalog uplink
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 sm:text-base">
              Scan-ready SKUs with photos, carton geometry, and live stock. Select units to print labels or dump a spreadsheet.
            </p>
          </div>
          <Button to="/inventory-app/items/new" variant="primary" className="self-start lg:self-auto">
            Register SKU
          </Button>
        </header>

        <div className="mt-8">
          <InventoryStatStrip items={items} selectedCount={selectedIds.length} />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--inv-scan)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Query name, SKU, or barcode…"
              className="inventory-input pl-10"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {visible.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="md:hidden"
                onClick={() => {
                  if (selectedIds.length === visible.length) {
                    clearSelection();
                    return;
                  }
                  selectAll(visible.map((item) => item.id));
                }}
              >
                {selectedIds.length === visible.length ? 'Clear selection' : 'Select visible'}
              </Button>
            ) : null}
            <ExportMenu items={exportItems} label={exportLabel} disabled={isLoading || visible.length === 0} />
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading || selectedItems.length === 0}
              onClick={handlePrintLabels}
            >
              <Printer className="size-4" aria-hidden="true" />
              {printLabelsLabel}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8">
            <InventoryLoadingState />
          </div>
        ) : error ? (
          <p className="inventory-panel mt-8 px-4 py-4 text-sm text-danger">{error}</p>
        ) : (
          <div className="mt-8">
            <InventoryTable
              items={visible}
              selectedIds={selectedIds}
              query={query}
              onClearQuery={() => setQuery('')}
              onToggleSelected={toggleSelected}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
          </div>
        )}
        </div>

        {selectedItems.length > 0 ? (
          <LabelSheet items={selectedItems} embedded className="inventory-label-print hidden" />
        ) : null}
    </InventoryPage>
  );
}
