import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { LabelSheet } from '@/components/inventory/LabelSheet';
import { useInventoryStore } from '@/store/useInventoryStore';

export function InventoryLabelsPage() {
  const [searchParams] = useSearchParams();
  const items = useInventoryStore((state) => state.items);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const hydrate = useInventoryStore((state) => state.hydrate);

  useEffect(() => {
    if (items.length === 0) {
      void hydrate();
    }
  }, [hydrate, items.length]);

  const labelItems = useMemo(() => {
    const ids = (searchParams.get('ids') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return [];
    }

    const idSet = new Set(ids);
    return items.filter((item) => idSet.has(item.id));
  }, [items, searchParams]);

  if (!isLoading && labelItems.length === 0) {
    return <Navigate to="/inventory-app" replace />;
  }

  return (
    <InventoryPage className="print:px-0 print:py-0">
      <p className="no-print mb-6">
        <Link
          to="/inventory-app"
          className="inline-flex min-h-11 items-center gap-2 font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Catalog
        </Link>
      </p>

      {isLoading && labelItems.length === 0 ? <InventoryLoadingState /> : <LabelSheet items={labelItems} />}
    </InventoryPage>
  );
}
