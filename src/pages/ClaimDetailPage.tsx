import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { ClaimStatusStepper } from '@/components/operations/ClaimStatusStepper';
import { OpsStatusBadge, claimStatusTone } from '@/components/operations/OpsStatusBadge';
import { RefundTracker } from '@/components/operations/RefundTracker';
import { SimulatedActionButton } from '@/components/operations/SimulatedActionButton';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Button } from '@/components/ui/Button';
import { useClaimsStore } from '@/store/useClaimsStore';
import {
  CLAIM_STATUS_LABELS,
  type ClaimResponsibility,
  type ClaimResolution,
  type ClaimStatus,
} from '@/types/operations';

const RESPONSIBILITY_OPTIONS: ClaimResponsibility[] = ['customer', 'carrier', '3pl', 'warehouse', 'unknown'];
const RESOLUTION_OPTIONS: ClaimResolution[] = ['refund', 'replacement', 'store_credit', 'reject'];

const STATUS_ACTIONS: Partial<Record<ClaimStatus, { next: ClaimStatus; label: string }>> = {
  new: { next: 'investigating', label: 'Start investigation' },
  investigating: { next: 'waiting_3pl', label: 'Escalate to 3PL wait' },
  waiting_3pl: { next: 'approved', label: 'Approve claim' },
  approved: { next: 'refunded', label: 'Mark refunded' },
  refunded: { next: 'closed', label: 'Close claim' },
};

export function ClaimDetailPage() {
  const { claimId } = useParams();
  const claim = useClaimsStore((state) => (claimId ? state.getClaimById(claimId) : undefined));
  const isLoading = useClaimsStore((state) => state.isLoading);
  const isSaving = useClaimsStore((state) => state.isSaving);
  const last3plSummary = useClaimsStore((state) => state.last3plSummary);
  const hydrate = useClaimsStore((state) => state.hydrate);
  const fetchClaimById = useClaimsStore((state) => state.fetchClaimById);
  const setStatus = useClaimsStore((state) => state.setStatus);
  const setResponsibility = useClaimsStore((state) => state.setResponsibility);
  const setResolution = useClaimsStore((state) => state.setResolution);
  const request3plInvestigation = useClaimsStore((state) => state.request3plInvestigation);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (claimId && !claim) {
      void fetchClaimById(claimId);
    }
  }, [claim, claimId, fetchClaimById]);

  const handleCopy3pl = useCallback(async () => {
    if (!last3plSummary) {
      return;
    }
    await navigator.clipboard.writeText(last3plSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [last3plSummary]);

  if (!isLoading && claimId && !claim) {
    return <Navigate to="/inventory-app/claims" replace />;
  }

  if (!claim) {
    return (
      <InventoryPage>
        <InventoryLoadingState />
      </InventoryPage>
    );
  }

  const statusAction = STATUS_ACTIONS[claim.status];

  return (
    <InventoryPage className="min-h-full">
      <Link
        to="/inventory-app/claims"
        className="inline-flex min-h-11 items-center gap-2 font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Claims list
      </Link>

      <header className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-display text-[11px] tracking-[0.22em] text-[color:var(--inv-scan)] uppercase">
            Claim {claim.displayId}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            Order {claim.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {claim.customerName} · {claim.productName} × {claim.quantity}
          </p>
          <div className="mt-3">
            <OpsStatusBadge label={CLAIM_STATUS_LABELS[claim.status]} tone={claimStatusTone(claim.status)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusAction ? (
            <Button
              type="button"
              variant="primary"
              disabled={isSaving}
              onClick={() => setStatus(claim.id, statusAction.next)}
            >
              {statusAction.label}
            </Button>
          ) : null}
          <SimulatedActionButton
            label="Request 3PL investigation"
            successLabel="Request sent"
            onAction={async () => {
              await request3plInvestigation(claim.id);
            }}
            disabled={isSaving || claim.status === 'closed'}
          />
        </div>
      </header>

      <div className="mt-8">
        <ClaimStatusStepper status={claim.status} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <InventoryPanel className="space-y-4 p-5 sm:p-6">
          <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
            Evidence
          </p>
          {claim.evidence.length === 0 ? (
            <p className="text-sm text-ink-muted">No evidence attached.</p>
          ) : (
            <ul className="space-y-2">
              {claim.evidence.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 text-sm text-[color:var(--inv-scan)] hover:underline"
                  >
                    <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </InventoryPanel>

        <InventoryPanel className="space-y-4 p-5 sm:p-6">
          <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
            Investigation
          </p>
          <fieldset className="space-y-2">
            <legend className="sr-only">Responsibility</legend>
            {RESPONSIBILITY_OPTIONS.map((option) => (
              <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="responsibility"
                  value={option}
                  checked={claim.responsibility === option}
                  onChange={() => setResponsibility(claim.id, option)}
                  className="accent-[color:var(--inv-scan)]"
                />
                <span className="capitalize">{option === '3pl' ? '3PL' : option}</span>
              </label>
            ))}
          </fieldset>
        </InventoryPanel>

        <InventoryPanel className="space-y-4 p-5 sm:p-6">
          <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
            Resolution
          </p>
          <fieldset className="space-y-2">
            <legend className="sr-only">Resolution</legend>
            {RESOLUTION_OPTIONS.map((option) => (
              <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="resolution"
                  value={option ?? ''}
                  checked={claim.resolution === option}
                  onChange={() => setResolution(claim.id, option)}
                  className="accent-[color:var(--inv-scan)]"
                />
                <span className="capitalize">{option?.replace('_', ' ')}</span>
              </label>
            ))}
          </fieldset>
        </InventoryPanel>

        {last3plSummary ? (
          <InventoryPanel className="space-y-3 p-5 sm:p-6">
            <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
              3PL request summary
            </p>
            <pre className="overflow-x-auto rounded-md border border-line bg-base p-3 text-xs text-ink-muted whitespace-pre-wrap">
              {last3plSummary}
            </pre>
            <Button type="button" variant="secondary" onClick={handleCopy3pl}>
              <Copy className="size-4" aria-hidden="true" />
              {copied ? 'Copied' : 'Copy to clipboard'}
            </Button>
          </InventoryPanel>
        ) : null}
      </div>

      {(claim.status === 'approved' || claim.status === 'refunded' || claim.resolution === 'refund') && (
        <div className="mt-6">
          <RefundTracker claim={claim} />
        </div>
      )}
    </InventoryPage>
  );
}
