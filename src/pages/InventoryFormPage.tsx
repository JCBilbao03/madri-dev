import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { InventoryForm } from '@/components/inventory/InventoryForm';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { useInventoryStore } from '@/store/useInventoryStore';

export function InventoryFormPage() {
  const { itemId } = useParams();
  const items = useInventoryStore((state) => state.items);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const hydrate = useInventoryStore((state) => state.hydrate);

  useEffect(() => {
    if (items.length === 0) {
      void hydrate();
    }
  }, [hydrate, items.length]);

  const isEdit = Boolean(itemId);
  const item = itemId ? items.find((entry) => entry.id === itemId) : undefined;

  if (isEdit && !isLoading && !item) {
    return <Navigate to="/inventory-app/products" replace />;
  }

  if (isEdit && !item) {
    return (
      <InventoryPage>
        <InventoryLoadingState />
      </InventoryPage>
    );
  }

  return (
    <InventoryPage className="min-h-full">
      <h1
        id="inventory-form-heading"
        className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
      >
        {isEdit ? 'Edit asset' : 'Register asset'}
      </h1>

      <div className="mt-8 flex-1">
        <InventoryForm item={item} />
      </div>
    </InventoryPage>
  );
}
