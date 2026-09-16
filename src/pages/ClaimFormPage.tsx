import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { InventoryField } from '@/components/inventory/InventoryField';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { useClaimsStore } from '@/store/useClaimsStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import type { ClaimIssueType, DamageClaimInput } from '@/types/operations';

const ISSUE_TYPES: { value: ClaimIssueType; label: string }[] = [
  { value: 'damaged', label: 'Damaged in transit' },
  { value: 'missing', label: 'Missing item' },
  { value: 'wrong_item', label: 'Wrong item received' },
];

const EMPTY_FORM = {
  orderNumber: '',
  customerName: '',
  productId: '',
  quantity: 1,
  issueType: 'damaged' as ClaimIssueType,
};

export function ClaimFormPage() {
  const navigate = useNavigate();
  const items = useInventoryStore((state) => state.items);
  const hydrateItems = useInventoryStore((state) => state.hydrate);
  const addClaim = useClaimsStore((state) => state.addClaim);
  const isSaving = useClaimsStore((state) => state.isSaving);
  const error = useClaimsStore((state) => state.error);

  const [form, setForm] = useState(EMPTY_FORM);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    void hydrateItems();
  }, [hydrateItems]);

  const selectedProduct = items.find((item) => item.id === form.productId);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!form.orderNumber.trim() || !form.customerName.trim() || !form.productId) {
        setLocalError('Order number, customer name, and product are required.');
        return;
      }

      if (!selectedProduct) {
        setLocalError('Select a valid product.');
        return;
      }

      setLocalError('');

      const input: DamageClaimInput = {
        orderNumber: form.orderNumber,
        customerName: form.customerName,
        productId: form.productId,
        productName: selectedProduct.name,
        quantity: form.quantity,
        issueType: form.issueType,
        evidence: [
          {
            id: 'ev-photo',
            label: 'Damage photo (demo)',
            url: 'https://picsum.photos/seed/dang-claim/800/600',
          },
        ],
      };

      try {
        const claim = await addClaim(input);
        navigate(`/inventory-app/claims/${claim.id}`);
      } catch {
        // Store surfaces error.
      }
    },
    [addClaim, form, navigate, selectedProduct],
  );

  return (
    <InventoryPage className="min-h-full">
      <Link
        to="/inventory-app/claims"
        className="inline-flex min-h-11 items-center gap-2 font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Claims list
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
          New damage claim
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">Log a customer issue</h1>
        <p className="mt-2 text-sm text-ink-muted">Demo form — creates a claim with placeholder evidence.</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        <InventoryPanel className="space-y-4 p-5 sm:p-6">
          <InventoryField
            label="Order number"
            name="orderNumber"
            value={form.orderNumber}
            onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))}
            placeholder="#DL-10482"
          />
          <InventoryField
            label="Customer name"
            name="customerName"
            value={form.customerName}
            onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
            placeholder="Jane Smith"
          />
          <label className="block space-y-2">
            <span className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">Product</span>
            <select
              name="productId"
              value={form.productId}
              onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              className="inventory-input"
              required
            >
              <option value="">Select product…</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </select>
          </label>
          <InventoryField
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({ ...current, quantity: Number.parseInt(event.target.value, 10) || 1 }))
            }
          />
          <fieldset className="space-y-2">
            <legend className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">Issue type</legend>
            {ISSUE_TYPES.map((entry) => (
              <label key={entry.value} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="issueType"
                  value={entry.value}
                  checked={form.issueType === entry.value}
                  onChange={() => setForm((current) => ({ ...current, issueType: entry.value }))}
                  className="accent-[color:var(--inv-scan)]"
                />
                {entry.label}
              </label>
            ))}
          </fieldset>
        </InventoryPanel>

        {localError || error ? (
          <p className="text-sm text-danger">{localError || error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Creating…' : 'Create claim'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/inventory-app/claims')}>
            Cancel
          </Button>
        </div>
      </form>
    </InventoryPage>
  );
}
