import type { ClaimStatus } from '@/types/operations';
import { CLAIM_STATUS_LABELS } from '@/types/operations';
import { cn } from '@/lib/utils';

const STEPS: ClaimStatus[] = [
  'new',
  'investigating',
  'waiting_3pl',
  'approved',
  'refunded',
  'closed',
];

interface ClaimStatusStepperProps {
  status: ClaimStatus;
  className?: string;
}

export function ClaimStatusStepper({ status, className }: ClaimStatusStepperProps) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <ol className={cn('flex flex-wrap gap-2 sm:gap-0', className)}>
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step}
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2 sm:flex-col sm:items-stretch sm:text-center',
              index < STEPS.length - 1 && 'sm:flex-1',
            )}
          >
            <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border font-display text-[10px]',
                  isComplete && 'border-[color:var(--inv-scan)] bg-[color:var(--inv-scan)]/15 text-[color:var(--inv-scan)]',
                  isCurrent && 'border-[color:var(--inv-scan)] text-[color:var(--inv-scan)]',
                  !isComplete && !isCurrent && 'border-line text-ink-muted',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide uppercase sm:text-[9px]',
                  isCurrent ? 'text-[color:var(--inv-scan)]' : 'text-ink-muted',
                )}
              >
                {CLAIM_STATUS_LABELS[step]}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  'hidden h-px flex-1 sm:block',
                  isComplete ? 'bg-[color:var(--inv-scan)]/40' : 'bg-line',
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
