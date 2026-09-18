import { AlertTriangle, ArrowLeft, Check, Copy, Pencil, Printer, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { BarcodeDisplay } from '@/components/inventory/BarcodeDisplay';
import { ExportMenu } from '@/components/inventory/ExportMenu';
import { PrintCodesMenu } from '@/components/inventory/PrintCodesMenu';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { LabelSheet } from '@/components/inventory/LabelSheet';
import {
  OpsStatusBadge,
  barcodeStatusTone,
  shopifySyncTone,
} from '@/components/operations/OpsStatusBadge';
import { SimulatedActionButton } from '@/components/operations/SimulatedActionButton';
import { Button } from '@/components/ui/Button';
import { confirmDelete, showErrorAlert, showSuccessToast } from '@/lib/sweetAlert';
import { useInventoryStore } from '@/store/useInventoryStore';
import { formatDimensions } from '@/types/inventory';

export function InventoryItemPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const items = useInventoryStore((state) => state.items);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const isSaving = useInventoryStore((state) => state.isSaving);
  const hydrate = useInventoryStore((state) => state.hydrate);
  const deleteItem = useInventoryStore((state) => state.deleteItem);
  const generateBarcode = useInventoryStore((state) => state.generateBarcode);
  const markVerified = useInventoryStore((state) => state.markVerified);
  const simulateShopifySync = useInventoryStore((state) => state.simulateShopifySync);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      void hydrate();
    }
  }, [hydrate, items.length]);

  useEffect(() => {
    const resetPrintMode = () => {
      delete document.body.dataset.printMode;
    };

    window.addEventListener('afterprint', resetPrintMode);
    return () => window.removeEventListener('afterprint', resetPrintMode);
  }, []);

  const item = itemId ? items.find((entry) => entry.id === itemId) : undefined;

  const handleDelete = useCallback(async () => {
    if (!item) {
      return;
    }

    const confirmed = await confirmDelete({
      title: 'Delete item?',
      text: `Delete ${item.name}? This cannot be undone.`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(item.id);
      showSuccessToast('Item deleted', `${item.name} was removed.`);
      navigate('/inventory-app/products');
    } catch (deleteError) {
      showErrorAlert(
        'Could not delete item',
        deleteError instanceof Error ? deleteError.message : 'Something went wrong.',
      );
    }
  }, [deleteItem, item, navigate]);

  const handlePrintDetails = useCallback(() => {
    document.body.dataset.printMode = 'details';
    window.print();
  }, []);

  const handlePrintLabels = useCallback(() => {
    document.body.dataset.printMode = 'labels';
    window.print();
  }, []);

  const handleCopyBarcode = useCallback(async () => {
    if (!item?.barcode) {
      return;
    }
    await navigator.clipboard.writeText(item.barcode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [item?.barcode]);

  if (!isLoading && !item) {
    return <Navigate to="/inventory-app/products" replace />;
  }

  if (!item) {
    return (
      <InventoryPage>
        <InventoryLoadingState />
      </InventoryPage>
    );
  }

  const isMissingBarcode = item.barcodeStatus === 'missing' || !item.barcode.trim();

  const telemetry: { label: string; value: string; span?: boolean }[] = [
    { label: 'Stock', value: String(item.stock) },
    { label: 'Mass', value: `${item.weightKg} kg` },
    { label: 'Envelope', value: formatDimensions(item.dimensions) },
    { label: 'Carton mass', value: `${item.cartonWeightKg} kg` },
    { label: 'Carton envelope', value: formatDimensions(item.cartonDimensions), span: true },
    { label: 'EAN / UPC', value: item.barcode || '—' },
  ];

  return (
    <InventoryPage className="min-h-full">
        <Link
          to="/inventory-app/products"
          className="no-print inline-flex min-h-11 items-center gap-2 font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Products
        </Link>

        {isMissingBarcode ? (
          <div className="no-print inventory-panel mt-6 flex items-center gap-3 border-danger/30 bg-danger/5 px-4 py-3">
            <AlertTriangle className="size-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <p className="font-medium text-ink">Barcode missing</p>
              <p className="text-sm text-ink-muted">Generate a barcode before ASN export or Shopify sync.</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="inventory-print-header">
            <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
              Product detail
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">{item.name}</h1>
            <p className="mt-2 font-display text-sm tracking-wide text-ink-muted">{item.sku}</p>
            <div className="no-print mt-3 flex flex-wrap gap-2">
              <OpsStatusBadge
                label={item.barcodeStatus === 'verified' ? 'Verified' : item.barcodeStatus === 'ready' ? 'Ready' : 'Missing'}
                tone={barcodeStatusTone(item.barcodeStatus)}
              />
              <OpsStatusBadge label={item.shopifySyncStatus} tone={shopifySyncTone(item.shopifySyncStatus)} />
            </div>
          </div>

          <div className="no-print flex flex-wrap gap-2">
            {isMissingBarcode ? (
              <SimulatedActionButton
                label="Generate barcode"
                successLabel="Generated"
                onAction={async () => {
                  await generateBarcode(item.id);
                }}
                disabled={isSaving}
                variant="primary"
              />
            ) : null}
            {!isMissingBarcode && item.barcodeStatus !== 'verified' ? (
              <Button type="button" variant="secondary" disabled={isSaving} onClick={() => markVerified(item.id)}>
                <Check className="size-4" aria-hidden="true" />
                Mark verified
              </Button>
            ) : null}
            {item.barcode ? (
              <Button type="button" variant="secondary" onClick={handleCopyBarcode}>
                <Copy className="size-4" aria-hidden="true" />
                {copied ? 'Copied' : 'Copy barcode'}
              </Button>
            ) : null}
            {!isMissingBarcode ? (
              <Button type="button" variant="secondary" onClick={handlePrintLabels}>
                <Printer className="size-4" aria-hidden="true" />
                Download label
              </Button>
            ) : null}
            <SimulatedActionButton
              label="Sync to Shopify"
              successLabel="Synced"
              onAction={async () => {
                await simulateShopifySync(item.id);
              }}
              disabled={isSaving || isMissingBarcode}
            />
            <ExportMenu items={[item]} label="Export" />
            <Button type="button" variant="secondary" onClick={handlePrintDetails}>
              <Printer className="size-4" aria-hidden="true" />
              Print details
            </Button>
            <PrintCodesMenu />
            <Button to={`/inventory-app/products/items/${item.id}/edit`} variant="secondary">
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Button>
            <Button type="button" variant="ghost" disabled={isSaving} onClick={handleDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        <div className="inventory-item-print mt-10 grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <InventoryPanel className="inventory-print-photo relative overflow-hidden">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.name} className="aspect-square w-full object-cover" />
            ) : (
              <div className="grid aspect-square place-items-center font-display text-[11px] tracking-[0.18em] text-ink-muted uppercase">
                No photo
              </div>
            )}
          </InventoryPanel>

          <div className="inventory-print-body grid gap-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-start">
            <BarcodeDisplay
              value={item.barcodeValue}
              label="Scan codes"
              compact
              className="inventory-print-codes"
            />

            <InventoryPanel className="inventory-print-details p-5 sm:p-6">
              <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
                Details
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {telemetry.map((entry) => (
                  <div key={entry.label} className={entry.span ? 'sm:col-span-2' : undefined}>
                    <dt className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">{entry.label}</dt>
                    <dd className="mt-1 font-display text-lg tracking-tight text-ink">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </InventoryPanel>
          </div>
        </div>

        <LabelSheet items={[item]} embedded className="inventory-label-print hidden" />
    </InventoryPage>
  );
}
