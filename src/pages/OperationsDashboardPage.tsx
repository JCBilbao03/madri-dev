import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ActionRequiredList } from '@/components/operations/ActionRequiredList';
import { ProcessComparison } from '@/components/operations/ProcessComparison';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { StatCard } from '@/components/rental/StatCard';
import { Button } from '@/components/ui/Button';
import {
  buildActionRequiredItems,
  computeOperationsMetrics,
} from '@/lib/operationsMetrics';
import { useAsnStore } from '@/store/useAsnStore';
import { useClaimsStore } from '@/store/useClaimsStore';
import { useInventoryStore } from '@/store/useInventoryStore';

export function OperationsDashboardPage() {
  const items = useInventoryStore((state) => state.items);
  const itemsLoading = useInventoryStore((state) => state.isLoading);
  const hydrateItems = useInventoryStore((state) => state.hydrate);

  const asns = useAsnStore((state) => state.asns);
  const asnsLoading = useAsnStore((state) => state.isLoading);
  const hydrateAsns = useAsnStore((state) => state.hydrate);

  const claims = useClaimsStore((state) => state.claims);
  const claimsLoading = useClaimsStore((state) => state.isLoading);
  const hydrateClaims = useClaimsStore((state) => state.hydrate);

  useEffect(() => {
    void hydrateItems();
    void hydrateAsns();
    void hydrateClaims();
  }, [hydrateAsns, hydrateClaims, hydrateItems]);

  const metrics = useMemo(
    () => computeOperationsMetrics(items, asns, claims),
    [asns, claims, items],
  );

  const actions = useMemo(
    () => buildActionRequiredItems(items, asns, claims),
    [asns, claims, items],
  );

  const isLoading = itemsLoading || asnsLoading || claimsLoading;

  return (
    <InventoryPage className="min-h-full">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            Dang Lifestyle // operations
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Today&apos;s overview
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 sm:text-base">
            One hub for barcodes, inbound ASNs, damage claims, and refunds — no spreadsheet loop.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button to="/inventory-app/asn/new" variant="primary">
            Create ASN
          </Button>
          <Button to="/inventory-app/claims/new" variant="secondary">
            New claim
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="mt-8">
          <InventoryLoadingState />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total products" value={metrics.totalProducts} />
            <Link to="/inventory-app/products?filter=missing" className="block transition-opacity hover:opacity-90">
              <StatCard label="Missing barcodes" value={metrics.missingBarcodes} />
            </Link>
            <Link to="/inventory-app/asn?filter=incomplete" className="block transition-opacity hover:opacity-90">
              <StatCard label="Pending ASNs" value={metrics.pendingAsns} />
            </Link>
            <Link to="/inventory-app/claims" className="block transition-opacity hover:opacity-90">
              <StatCard label="Open claims" value={metrics.openClaims} />
            </Link>
            <Link to="/inventory-app/claims?status=approved" className="block transition-opacity hover:opacity-90">
              <StatCard label="Refunds pending" value={metrics.refundsPending} />
            </Link>
            <StatCard label="Needs attention" value={metrics.ordersRequiringAttention} />
          </div>

          <section className="mt-10" aria-labelledby="action-required-heading">
            <h2 id="action-required-heading" className="font-display text-lg font-medium text-ink">
              Action required
            </h2>
            <div className="mt-4">
              <ActionRequiredList items={actions} />
            </div>
          </section>

          <section className="mt-10" aria-labelledby="process-comparison-heading">
            <h2 id="process-comparison-heading" className="font-display text-lg font-medium text-ink">
              Process comparison
            </h2>
            <div className="mt-4">
              <ProcessComparison />
            </div>
          </section>
        </>
      )}
    </InventoryPage>
  );
}
