import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { ValidationIssueList } from '@/components/operations/ValidationIssueList';
import { OpsStatusBadge, asnStatusTone } from '@/components/operations/OpsStatusBadge';
import { SimulatedActionButton } from '@/components/operations/SimulatedActionButton';
import { InventoryField } from '@/components/inventory/InventoryField';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { filterInventoryItems } from '@/lib/inventory';
import { useAsnStore } from '@/store/useAsnStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import { DEMO_WAREHOUSES, ASN_STATUS_LABELS, type AsnInput, type AsnLineItem } from '@/types/operations';
import type { InventoryItem } from '@/types/inventory';

const EMPTY_ASN: AsnInput = {
  warehouse: '',
  shipmentDate: '',
  poReference: '',
  carrier: '',
  trackingReference: '',
  expectedArrival: '',
  lineItems: [],
};

function productToLineItem(product: InventoryItem, quantity = 1): AsnLineItem {
  return {
    productId: product.id,
    sku: product.sku,
    barcode: product.barcode,
    productName: product.name,
    quantity,
    cartonWeightKg: product.cartonWeightKg,
    cartonDimensions: { ...product.cartonDimensions },
  };
}

export function AsnBuilderPage() {
  const { asnId } = useParams();
  const navigate = useNavigate();
  const isNew = !asnId;

  const items = useInventoryStore((state) => state.items);
  const itemsLoading = useInventoryStore((state) => state.isLoading);
  const hydrateItems = useInventoryStore((state) => state.hydrate);

  const asn = useAsnStore((state) => (asnId ? state.getAsnById(asnId) : undefined));
  const isLoading = useAsnStore((state) => state.isLoading);
  const isSaving = useAsnStore((state) => state.isSaving);
  const error = useAsnStore((state) => state.error);
  const hydrateAsns = useAsnStore((state) => state.hydrate);
  const fetchAsnById = useAsnStore((state) => state.fetchAsnById);
  const addAsn = useAsnStore((state) => state.addAsn);
  const saveAsn = useAsnStore((state) => state.saveAsn);
  const validateAsn = useAsnStore((state) => state.validateAsn);
  const generateAsn = useAsnStore((state) => state.generateAsn);
  const submitAsn = useAsnStore((state) => state.submitAsn);

  const [form, setForm] = useState<AsnInput>(EMPTY_ASN);
  const [productQuery, setProductQuery] = useState('');
  const [initialized, setInitialized] = useState(isNew);

  useEffect(() => {
    void hydrateItems();
    void hydrateAsns();
  }, [hydrateAsns, hydrateItems]);

  useEffect(() => {
    if (!asnId) {
      return;
    }

    if (!asn && !isLoading) {
      void fetchAsnById(asnId).then((loaded) => {
        if (loaded) {
          setForm({
            warehouse: loaded.warehouse,
            shipmentDate: loaded.shipmentDate,
            poReference: loaded.poReference,
            carrier: loaded.carrier,
            trackingReference: loaded.trackingReference,
            expectedArrival: loaded.expectedArrival,
            lineItems: loaded.lineItems,
          });
        }
        setInitialized(true);
      });
      return;
    }

    if (asn) {
      setForm({
        warehouse: asn.warehouse,
        shipmentDate: asn.shipmentDate,
        poReference: asn.poReference,
        carrier: asn.carrier,
        trackingReference: asn.trackingReference,
        expectedArrival: asn.expectedArrival,
        lineItems: asn.lineItems,
      });
      setInitialized(true);
    }
  }, [asn, asnId, fetchAsnById, isLoading]);

  const pickerProducts = useMemo(
    () => filterInventoryItems(items, productQuery).slice(0, 8),
    [items, productQuery],
  );

  const updateField = useCallback(<K extends keyof AsnInput>(key: K, value: AsnInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const addProductLine = useCallback(
    (product: InventoryItem) => {
      setForm((current) => {
        const existing = current.lineItems.find((line) => line.productId === product.id);
        if (existing) {
          return {
            ...current,
            lineItems: current.lineItems.map((line) =>
              line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
            ),
          };
        }
        return {
          ...current,
          lineItems: [...current.lineItems, productToLineItem(product)],
        };
      });
      setProductQuery('');
    },
    [],
  );

  const updateLineQuantity = useCallback((productId: string, quantity: number) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((line) =>
        line.productId === productId ? { ...line, quantity: Math.max(0, quantity) } : line,
      ),
    }));
  }, []);

  const removeLine = useCallback((productId: string) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.filter((line) => line.productId !== productId),
    }));
  }, []);

  const persistForm = useCallback(async (): Promise<string | null> => {
    if (isNew) {
      const created = await addAsn(form);
      navigate(`/inventory-app/asn/${created.id}`, { replace: true });
      return created.id;
    }

    if (!asnId) {
      return null;
    }

    await saveAsn(asnId, form);
    return asnId;
  }, [addAsn, asnId, form, isNew, navigate, saveAsn]);

  const handleValidate = useCallback(async () => {
    const id = await persistForm();
    if (!id) {
      return;
    }
    await validateAsn(id, items);
  }, [items, persistForm, validateAsn]);

  const handleGenerate = useCallback(async () => {
    const id = await persistForm();
    if (!id) {
      return;
    }
    await generateAsn(id, items);
  }, [generateAsn, items, persistForm]);

  const handleSubmit = useCallback(async () => {
    if (!asnId) {
      return;
    }
    await submitAsn(asnId);
  }, [asnId, submitAsn]);

  if (!isNew && initialized && !isLoading && !asn) {
    return <Navigate to="/inventory-app/asn" replace />;
  }

  if (!isNew && !initialized) {
    return (
      <InventoryPage>
        <InventoryLoadingState />
      </InventoryPage>
    );
  }

  const validationIssues = asn?.validationIssues ?? [];

  return (
    <InventoryPage className="min-h-full">
      <Link
        to="/inventory-app/asn"
        className="inline-flex min-h-11 items-center gap-2 font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        ASN list
      </Link>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            {isNew ? 'New ASN' : 'Edit ASN'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            {form.poReference || 'Inbound shipment'}
          </h1>
          {asn ? (
            <div className="mt-2">
              <OpsStatusBadge label={ASN_STATUS_LABELS[asn.status]} tone={asnStatusTone(asn.status)} />
            </div>
          ) : null}
        </div>
      </header>

      {error ? <p className="inventory-panel mt-4 px-4 py-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="space-y-6">
          <InventoryPanel className="space-y-4 p-5 sm:p-6">
            <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
              01 // shipment information
            </p>
            <label className="block space-y-2">
              <span className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">
                Warehouse
              </span>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={(event) => updateField('warehouse', event.target.value)}
                className="inventory-input"
              >
                <option value="">Select warehouse…</option>
                {DEMO_WAREHOUSES.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <InventoryField
                label="Shipment date"
                name="shipmentDate"
                type="date"
                value={form.shipmentDate}
                onChange={(event) => updateField('shipmentDate', event.target.value)}
              />
              <InventoryField
                label="Expected arrival"
                name="expectedArrival"
                type="date"
                value={form.expectedArrival}
                onChange={(event) => updateField('expectedArrival', event.target.value)}
              />
            </div>
            <InventoryField
              label="PO reference"
              name="poReference"
              value={form.poReference}
              onChange={(event) => updateField('poReference', event.target.value)}
              placeholder="PO-DL-2026-001"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <InventoryField
                label="Carrier"
                name="carrier"
                value={form.carrier}
                onChange={(event) => updateField('carrier', event.target.value)}
                placeholder="DHL Freight"
              />
              <InventoryField
                label="Tracking reference"
                name="trackingReference"
                value={form.trackingReference}
                onChange={(event) => updateField('trackingReference', event.target.value)}
                placeholder="JD0123456789"
              />
            </div>
          </InventoryPanel>

          <InventoryPanel className="space-y-4 p-5 sm:p-6">
            <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
              02 // add products
            </p>
            <label className="relative block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--inv-scan)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Search products to add…"
                className="inventory-input pl-10"
              />
            </label>

            {productQuery.trim() && pickerProducts.length > 0 ? (
              <ul className="space-y-1">
                {pickerProducts.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => addProductLine(product)}
                      className="flex w-full min-h-11 items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-left text-sm transition-colors hover:border-[color:var(--inv-scan)]/40"
                    >
                      <span>
                        <span className="font-medium text-ink">{product.name}</span>
                        <span className="ml-2 font-display text-xs text-ink-muted">{product.sku}</span>
                      </span>
                      <Plus className="size-4 shrink-0 text-[color:var(--inv-scan)]" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {form.lineItems.length === 0 ? (
              <p className="text-sm text-ink-muted">No line items yet. Search and add products above.</p>
            ) : (
              <ul className="space-y-2">
                {form.lineItems.map((line) => (
                  <li
                    key={line.productId}
                    className="flex flex-col gap-3 rounded-md border border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{line.productName}</p>
                      <p className="font-display text-xs text-ink-muted">
                        {line.sku} · {line.barcode || 'no barcode'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="text-ink-muted">Qty</span>
                        <input
                          type="number"
                          min={0}
                          value={line.quantity}
                          onChange={(event) =>
                            updateLineQuantity(line.productId, Number.parseInt(event.target.value, 10) || 0)
                          }
                          className="inventory-input w-20"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="min-h-11 rounded-md border border-line p-2 text-ink-muted hover:border-danger/40 hover:text-danger"
                        aria-label={`Remove ${line.productName}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </InventoryPanel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <InventoryPanel className="space-y-4 p-5 sm:p-6">
            <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
              03 // validate & generate
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" disabled={isSaving || itemsLoading} onClick={handleValidate}>
                Validate ASN
              </Button>
              <Button type="button" variant="primary" disabled={isSaving || itemsLoading} onClick={handleGenerate}>
                Generate XLSX
              </Button>
            </div>
            {asn?.generatedFileName ? (
              <p className="text-xs text-ink-muted">Last file: {asn.generatedFileName}</p>
            ) : null}
            {asn?.status === 'generated' || asn?.status === 'submitted' ? (
              <SimulatedActionButton
                label="Submit to 3PL"
                successLabel="Submitted"
                onAction={handleSubmit}
                disabled={isSaving}
              />
            ) : null}
          </InventoryPanel>

          <ValidationIssueList issues={validationIssues} />
        </aside>
      </div>
    </InventoryPage>
  );
}
