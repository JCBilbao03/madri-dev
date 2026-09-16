import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import { cn } from '@/lib/utils';

interface ProcessComparisonProps {
  className?: string;
}

const CURRENT_STEPS = [
  'Spreadsheet product list',
  'Manual Shopify updates',
  'Email ASN to 3PL',
  'Back-and-forth on damage claims',
  'Separate refund tracking',
];

const PROPOSED_STEPS = [
  'Single operations dashboard',
  'Fix barcodes in one place',
  'Validate & generate ASN XLSX',
  'Track claims with 3PL workflow',
  'Refund status in claim detail',
];

export function ProcessComparison({ className }: ProcessComparisonProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      <InventoryPanel className="p-5 sm:p-6">
        <p className="font-display text-[11px] tracking-[0.2em] text-ink-muted uppercase">Current process</p>
        <ol className="mt-4 space-y-2">
          {CURRENT_STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-2 text-sm text-ink-muted">
              <span className="mt-0.5 font-display text-[10px] text-danger">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </InventoryPanel>

      <InventoryPanel className="border-[color:var(--inv-scan)]/30 p-5 sm:p-6">
        <p className="font-display text-[11px] tracking-[0.2em] text-[color:var(--inv-scan)] uppercase">
          Proposed process
        </p>
        <ol className="mt-4 space-y-2">
          {PROPOSED_STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-0.5 font-display text-[10px] text-[color:var(--inv-scan)]">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </InventoryPanel>
    </div>
  );
}
