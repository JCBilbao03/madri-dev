import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BarcodeDisplay } from '@/components/inventory/BarcodeDisplay';
import { DimensionsFields } from '@/components/inventory/DimensionsFields';
import { InventoryField } from '@/components/inventory/InventoryField';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { PhotoUpload } from '@/components/inventory/PhotoUpload';
import { Button } from '@/components/ui/Button';
import { useInventoryStore } from '@/store/useInventoryStore';
import {
  EMPTY_INVENTORY_INPUT,
  type InventoryItem,
  type InventoryItemInput,
} from '@/types/inventory';

interface InventoryFormProps {
  item?: InventoryItem;
}

function toInput(item: InventoryItem): InventoryItemInput {
  return {
    name: item.name,
    sku: item.sku,
    stock: item.stock,
    weightKg: item.weightKg,
    dimensions: { ...item.dimensions },
    cartonWeightKg: item.cartonWeightKg,
    cartonDimensions: { ...item.cartonDimensions },
    photoUrl: item.photoUrl,
  };
}

export function InventoryForm({ item }: InventoryFormProps) {
  const navigate = useNavigate();
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const isSaving = useInventoryStore((state) => state.isSaving);
  const storeError = useInventoryStore((state) => state.error);

  const [form, setForm] = useState<InventoryItemInput>(item ? toInput(item) : { ...EMPTY_INVENTORY_INPUT });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savedItem, setSavedItem] = useState<InventoryItem | null>(item ?? null);
  const [error, setError] = useState('');

  const updateField = useCallback(<K extends keyof InventoryItemInput>(key: K, value: InventoryItemInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const handlePhotoSelect = useCallback(
    (file: File | null, previewUrl: string) => {
      setPhotoFile(file);
      updateField('photoUrl', previewUrl);
    },
    [updateField],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!form.name.trim()) {
        setError('Product name is required.');
        return;
      }

      if (!form.sku.trim()) {
        setError('SKU is required.');
        return;
      }

      setError('');

      try {
        if (item) {
          const updated = await updateItem(item.id, form, photoFile);
          if (updated) {
            setSavedItem(updated);
            navigate(`/inventory-app/items/${updated.id}`);
          }
          return;
        }

        const created = await addItem(form, photoFile);
        setSavedItem(created);
        navigate(`/inventory-app/items/${created.id}`);
      } catch {
        // Store surfaces the error message.
      }
    },
    [addItem, form, item, navigate, photoFile, updateItem],
  );

  const previewBarcode = form.sku.trim().toUpperCase();
  const displayError = error || storeError;

  return (
    <form onSubmit={handleSubmit} className="grid h-full gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)]">
      <div className="space-y-6">
        <InventoryPanel className="space-y-5 p-5 sm:p-6">
          <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
            01 // payload
          </p>
          <InventoryField
            label="Product name"
            name="name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ceramic planter — terracotta"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InventoryField
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={(event) => updateField('sku', event.target.value)}
              placeholder="SKU-10042"
            />
            <InventoryField
              label="Stock on hand"
              name="stock"
              type="number"
              min={0}
              step={1}
              value={form.stock || ''}
              onChange={(event) => updateField('stock', Number.parseInt(event.target.value, 10) || 0)}
            />
          </div>
          <InventoryField
            layout="inline"
            label="Product weight (kg)"
            name="weightKg"
            type="number"
            min={0}
            step="0.01"
            value={form.weightKg || ''}
            onChange={(event) => updateField('weightKg', Number.parseFloat(event.target.value) || 0)}
          />
          <DimensionsFields
            label="Product envelope"
            value={form.dimensions}
            onChange={(dimensions) => updateField('dimensions', dimensions)}
          />
        </InventoryPanel>

        <InventoryPanel className="space-y-5 p-5 sm:p-6">
          <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
            02 // carton
          </p>
          <InventoryField
            layout="inline"
            label="Carton weight (kg)"
            name="cartonWeightKg"
            type="number"
            min={0}
            step="0.01"
            value={form.cartonWeightKg || ''}
            onChange={(event) => updateField('cartonWeightKg', Number.parseFloat(event.target.value) || 0)}
          />
          <DimensionsFields
            label="Carton envelope"
            value={form.cartonDimensions}
            onChange={(cartonDimensions) => updateField('cartonDimensions', cartonDimensions)}
          />
        </InventoryPanel>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:items-start">
          <div className="flex flex-col gap-4">
            <InventoryPanel className="p-5 sm:p-6">
              <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
                03 // optics
              </p>
              <div className="mt-4">
                <PhotoUpload previewUrl={form.photoUrl} onFileSelect={handlePhotoSelect} />
              </div>
            </InventoryPanel>

            {displayError ? <p className="text-sm text-danger">{displayError}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? 'Uplinking…' : item ? 'Commit changes' : 'Commit & generate codes'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/inventory-app')}>
                Abort
              </Button>
            </div>
          </div>

          {previewBarcode ? (
            <BarcodeDisplay
              value={previewBarcode}
              label={savedItem ? 'Warehouse codes' : 'Preview // codes lock on commit'}
            />
          ) : (
            <InventoryPanel className="p-5 sm:p-6">
              <p className="font-display text-[11px] tracking-[0.2em] text-ink-muted uppercase">Codes</p>
              <p className="mt-2 text-sm text-ink-muted">Enter a SKU to preview barcode and QR.</p>
            </InventoryPanel>
          )}
        </div>
      </aside>
    </form>
  );
}
