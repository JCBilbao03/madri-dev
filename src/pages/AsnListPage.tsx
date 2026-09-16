import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { OpsStatusBadge, asnStatusTone } from '@/components/operations/OpsStatusBadge';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { isAsnIncomplete } from '@/lib/asnValidation';
import { useAsnStore } from '@/store/useAsnStore';
import { ASN_STATUS_LABELS } from '@/types/operations';
import { cn } from '@/lib/utils';

export function AsnListPage() {
  const [searchParams] = useSearchParams();
  const filterIncomplete = searchParams.get('filter') === 'incomplete';

  const asns = useAsnStore((state) => state.asns);
  const isLoading = useAsnStore((state) => state.isLoading);
  const error = useAsnStore((state) => state.error);
  const hydrate = useAsnStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const visible = useMemo(() => {
    if (!filterIncomplete) {
      return asns;
    }
    return asns.filter((asn) => isAsnIncomplete(asn));
  }, [asns, filterIncomplete]);

  return (
    <InventoryPage className="min-h-full">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            ASN builder
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Inbound shipments
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink/70 sm:text-base">
            Validate line items, generate 3PL-format XLSX, and submit — simulated for demo.
          </p>
        </div>
        <Button to="/inventory-app/asn/new" variant="primary" className="self-start lg:self-auto">
          Create new ASN
        </Button>
      </header>

      {filterIncomplete ? (
        <p className="inventory-panel mt-6 border-amber-500/30 px-4 py-3 text-sm text-ink">
          Showing incomplete ASNs only.
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
                  <th className="px-4 py-3">PO reference</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Lines</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((asn) => (
                  <tr key={asn.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/inventory-app/asn/${asn.id}`}
                        className="font-medium text-ink hover:text-[color:var(--inv-scan)]"
                      >
                        {asn.poReference || 'Untitled ASN'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{asn.warehouse || '—'}</td>
                    <td className="px-4 py-3">{asn.lineItems.length}</td>
                    <td className="px-4 py-3 text-ink-muted">{asn.expectedArrival || '—'}</td>
                    <td className="px-4 py-3">
                      <OpsStatusBadge label={ASN_STATUS_LABELS[asn.status]} tone={asnStatusTone(asn.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 space-y-3 md:hidden">
            {visible.map((asn) => (
              <li key={asn.id}>
                <Link
                  to={`/inventory-app/asn/${asn.id}`}
                  className={cn(
                    'inventory-panel block px-4 py-4 transition-colors hover:border-[color:var(--inv-scan)]/40',
                    isAsnIncomplete(asn) && 'border-amber-500/30',
                  )}
                >
                  <p className="font-medium text-ink">{asn.poReference || 'Untitled ASN'}</p>
                  <p className="mt-1 text-sm text-ink-muted">{asn.warehouse || 'No warehouse'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <OpsStatusBadge label={ASN_STATUS_LABELS[asn.status]} tone={asnStatusTone(asn.status)} />
                    <span className="text-xs text-ink-muted">{asn.lineItems.length} lines</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="inventory-panel mt-8 px-4 py-6 text-center text-sm text-ink-muted">
              No ASNs yet. Create your first inbound shipment.
            </p>
          ) : null}
        </>
      )}
    </InventoryPage>
  );
}
