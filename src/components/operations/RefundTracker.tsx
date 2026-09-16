import { useCallback } from 'react';

import { OpsStatusBadge, shopifySyncTone } from '@/components/operations/OpsStatusBadge';
import { SimulatedActionButton } from '@/components/operations/SimulatedActionButton';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { useClaimsStore } from '@/store/useClaimsStore';
import type { DamageClaim } from '@/types/operations';
import { cn } from '@/lib/utils';

interface RefundTrackerProps {
  claim: DamageClaim;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount);
}

export function RefundTracker({ claim, className }: RefundTrackerProps) {
  const updateRefund = useClaimsStore((state) => state.updateRefund);
  const setStatus = useClaimsStore((state) => state.setStatus);
  const isSaving = useClaimsStore((state) => state.isSaving);

  const total = claim.refund.customerRefund + claim.refund.shippingRefund;

  const handleMarkShopifyProcessed = useCallback(async () => {
    await updateRefund(claim.id, { shopifyRefundStatus: 'completed' });
    if (claim.status === 'approved') {
      await setStatus(claim.id, 'refunded');
    }
  }, [claim.id, claim.status, setStatus, updateRefund]);

  const handleToggleNotified = useCallback(async () => {
    await updateRefund(claim.id, { customerNotified: !claim.refund.customerNotified });
  }, [claim.id, claim.refund.customerNotified, updateRefund]);

  return (
    <InventoryPanel className={cn('space-y-5 p-5 sm:p-6', className)}>
      <div>
        <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
          Refund tracker
        </p>
        <p className="mt-1 text-sm text-ink-muted">Simulated Shopify and 3PL refund status.</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">Customer refund</dt>
          <dd className="mt-1 font-display text-lg text-ink">{formatCurrency(claim.refund.customerRefund)}</dd>
        </div>
        <div>
          <dt className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">Shipping refund</dt>
          <dd className="mt-1 font-display text-lg text-ink">{formatCurrency(claim.refund.shippingRefund)}</dd>
        </div>
        <div>
          <dt className="font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">Total</dt>
          <dd className="mt-1 font-display text-lg text-[color:var(--inv-scan)]">{formatCurrency(total)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Shopify refund</span>
          <OpsStatusBadge
            label={claim.refund.shopifyRefundStatus}
            tone={shopifySyncTone(claim.refund.shopifyRefundStatus)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">3PL claim</span>
          <OpsStatusBadge
            label={claim.refund.claimRefundStatus}
            tone={shopifySyncTone(claim.refund.claimRefundStatus)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {claim.refund.shopifyRefundStatus === 'pending' && claim.status === 'approved' ? (
          <SimulatedActionButton
            label="Mark Shopify processed"
            successLabel="Processed"
            onAction={handleMarkShopifyProcessed}
            disabled={isSaving}
          />
        ) : null}
        <button
          type="button"
          onClick={handleToggleNotified}
          disabled={isSaving}
          className={cn(
            'min-h-11 rounded-md border px-4 py-2 text-sm transition-colors',
            claim.refund.customerNotified
              ? 'border-[color:var(--inv-scan)]/50 text-[color:var(--inv-scan)]'
              : 'border-line text-ink-muted hover:border-[color:var(--inv-scan)]/30',
          )}
        >
          Customer notified: {claim.refund.customerNotified ? 'Yes' : 'No'}
        </button>
      </div>
    </InventoryPanel>
  );
}
