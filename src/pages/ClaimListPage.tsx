import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { OpsStatusBadge, claimStatusTone } from '@/components/operations/OpsStatusBadge';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { computeClaimStatusCounts } from '@/lib/operationsMetrics';
import { useClaimsStore } from '@/store/useClaimsStore';
import { CLAIM_STATUS_LABELS, type ClaimStatus } from '@/types/operations';

export function ClaimListPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') as ClaimStatus | null;

  const claims = useClaimsStore((state) => state.claims);
  const isLoading = useClaimsStore((state) => state.isLoading);
  const error = useClaimsStore((state) => state.error);
  const hydrate = useClaimsStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const statusCounts = useMemo(() => computeClaimStatusCounts(claims), [claims]);

  const visible = useMemo(() => {
    if (!statusFilter) {
      return claims;
    }
    return claims.filter((claim) => claim.status === statusFilter);
  }, [claims, statusFilter]);

  return (
    <InventoryPage className="min-h-full">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            Damage & refund center
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Claims workflow
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 sm:text-base">
            Track damage claims from investigation through 3PL requests to refund processing.
          </p>
        </div>
        <Button to="/inventory-app/claims/new" variant="primary" className="self-start lg:self-auto">
          New claim
        </Button>
      </header>

      <InventoryPanel className="mt-8 overflow-x-auto p-4 sm:p-5">
        <p className="font-display text-[11px] tracking-[0.2em] text-ink-muted uppercase">Status summary</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(statusCounts) as ClaimStatus[]).map((status) => (
            <div key={status}>
              <dt className="text-xs text-ink-muted">{CLAIM_STATUS_LABELS[status]}</dt>
              <dd className="font-display text-xl text-ink">{statusCounts[status]}</dd>
            </div>
          ))}
        </dl>
      </InventoryPanel>

      {statusFilter ? (
        <p className="inventory-panel mt-4 px-4 py-3 text-sm text-ink">
          Filtered by status: <strong>{CLAIM_STATUS_LABELS[statusFilter]}</strong>
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-8">
          <InventoryLoadingState />
        </div>
      ) : error ? (
        <p className="inventory-panel mt-8 px-4 py-4 text-sm text-danger">{error}</p>
      ) : (
        <>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="inventory-panel w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-display text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                  <th className="px-4 py-3">Claim</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((claim) => (
                  <tr key={claim.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/inventory-app/claims/${claim.id}`}
                        className="font-medium text-ink hover:text-[color:var(--inv-scan)]"
                      >
                        {claim.displayId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-display text-ink-muted">{claim.orderNumber}</td>
                    <td className="px-4 py-3">{claim.customerName}</td>
                    <td className="px-4 py-3 text-ink-muted">{claim.productName}</td>
                    <td className="px-4 py-3 capitalize">{claim.issueType.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <OpsStatusBadge label={CLAIM_STATUS_LABELS[claim.status]} tone={claimStatusTone(claim.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3 md:hidden">
            {visible.map((claim) => (
              <li key={claim.id}>
                <Link
                  to={`/inventory-app/claims/${claim.id}`}
                  className="inventory-panel block px-4 py-4 transition-colors hover:border-[color:var(--inv-scan)]/40"
                >
                  <p className="font-medium text-ink">
                    {claim.displayId} · {claim.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{claim.customerName}</p>
                  <p className="mt-1 text-sm text-ink">{claim.productName}</p>
                  <div className="mt-3">
                    <OpsStatusBadge label={CLAIM_STATUS_LABELS[claim.status]} tone={claimStatusTone(claim.status)} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="inventory-panel mt-8 px-4 py-6 text-center text-sm text-ink-muted">
              No claims match this filter.
            </p>
          ) : null}
        </>
      )}
    </InventoryPage>
  );
}
