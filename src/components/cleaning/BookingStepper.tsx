import { cn } from '@/lib/utils';
import { BOOKING_STEPS, type BookingStep } from '@/types/cleaning';

const STEP_LABELS: Record<BookingStep, string> = {
  datetime: 'Date & time',
  address: 'Address',
  confirm: 'Confirm',
};

interface BookingStepperProps {
  step: BookingStep;
}

export function BookingStepper({ step }: BookingStepperProps) {
  const currentIndex = BOOKING_STEPS.indexOf(step);

  return (
    <ol className="flex items-center gap-2" aria-label="Booking steps">
      {BOOKING_STEPS.map((item, index) => {
        const isCurrent = item === step;
        const isComplete = index < currentIndex;

        return (
          <li key={item} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold',
                isCurrent || isComplete
                  ? 'border-accent/50 bg-accent/15 text-accent-soft'
                  : 'border-line bg-base text-ink-muted',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span className={cn('truncate text-xs font-medium', isCurrent ? 'text-ink' : 'text-ink-muted')}>
              {STEP_LABELS[item]}
            </span>
            {index < BOOKING_STEPS.length - 1 ? (
              <span aria-hidden="true" className="hidden h-px flex-1 bg-line sm:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
