import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { BookingStepper } from '@/components/cleaning/BookingStepper';
import { Button } from '@/components/ui/Button';
import { useDismissableLayer } from '@/hooks/useDismissableLayer';
import { formatBookingDate, formatHourlyRate, formatTimeSlot, getCleanerById, todayDateInput } from '@/lib/cleaning';
import { useBookingStore } from '@/store/useBookingStore';
import { BOOKING_TIME_SLOTS, isCleaningService } from '@/types/cleaning';

const fieldClasses =
  'w-full rounded-xl border bg-base px-4 py-3 text-sm text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

export function BookingModal() {
  const isOpen = useBookingStore((state) => state.isBookingOpen);
  const step = useBookingStore((state) => state.step);
  const draft = useBookingStore((state) => state.draft);
  const closeBooking = useBookingStore((state) => state.closeBooking);
  const setDraft = useBookingStore((state) => state.setDraft);
  const nextStep = useBookingStore((state) => state.nextStep);
  const prevStep = useBookingStore((state) => state.prevStep);
  const confirmBooking = useBookingStore((state) => state.confirmBooking);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const minDate = useMemo(() => todayDateInput(), []);

  const cleaner = draft.cleanerId ? getCleanerById(draft.cleanerId) : undefined;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  useDismissableLayer({
    isOpen,
    onDismiss: closeBooking,
    containerRef: dialogRef,
  });

  const handleServiceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      if (value === '') {
        setDraft({ serviceType: '' });
        setErrors((current) => ({ ...current, serviceType: '' }));
        return;
      }

      if (isCleaningService(value)) {
        setDraft({ serviceType: value });
        setErrors((current) => ({ ...current, serviceType: '' }));
      }
    },
    [setDraft],
  );

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDraft({ date: event.target.value });
      setErrors((current) => ({ ...current, date: '' }));
    },
    [setDraft],
  );

  const handleTimeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setDraft({ time: event.target.value });
      setErrors((current) => ({ ...current, time: '' }));
    },
    [setDraft],
  );

  const handleAddressChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDraft({ address: event.target.value });
      setErrors((current) => ({ ...current, address: '' }));
    },
    [setDraft],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (step === 'datetime') {
        const nextErrors: Record<string, string> = {};
        if (!draft.serviceType) {
          nextErrors.serviceType = 'Choose a service.';
        }
        if (!draft.date) {
          nextErrors.date = 'Pick a date.';
        }
        if (!draft.time) {
          nextErrors.time = 'Pick a start time.';
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {
          nextStep();
        }
        return;
      }

      if (step === 'address') {
        if (draft.address.trim().length < 8) {
          setErrors({ address: 'Add a street address so the cleaner can find you.' });
          return;
        }
        setErrors({});
        nextStep();
        return;
      }

      const booking = confirmBooking();
      if (!booking) {
        setErrors({ confirm: 'Something was missing. Go back and check the details.' });
      }
    },
    [confirmBooking, draft.address, draft.date, draft.serviceType, draft.time, nextStep, step],
  );

  const handleClose = useCallback(() => {
    setErrors({});
    closeBooking();
  }, [closeBooking]);

  const title =
    step === 'datetime' ? 'Pick a time' : step === 'address' ? 'Where should they go?' : 'Confirm the booking';

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close booking form"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-muted transition hover:bg-surface-raised hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <p className="text-xs font-semibold tracking-[0.2em] text-accent-soft uppercase">Book a cleaner</p>
            <h2 id={titleId} className="mt-2 pr-10 font-display text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {cleaner
                ? `${cleaner.name} · ${formatHourlyRate(cleaner.hourlyRate)}`
                : 'Choose a cleaner from the list to continue.'}
            </p>

            <div className="mt-6">
              <BookingStepper step={step} />
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {step === 'datetime' ? (
                <>
                  <div>
                    <label htmlFor="booking-service" className="mb-2 block text-sm font-medium text-ink">
                      Service
                    </label>
                    <select
                      id="booking-service"
                      value={draft.serviceType}
                      onChange={handleServiceChange}
                      className={fieldClasses}
                    >
                      <option value="">Select a service</option>
                      {(cleaner?.services ?? []).map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                    {errors.serviceType ? <p className="mt-2 text-sm text-danger">{errors.serviceType}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="booking-date" className="mb-2 block text-sm font-medium text-ink">
                        Date
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        min={minDate}
                        value={draft.date}
                        onChange={handleDateChange}
                        className={fieldClasses}
                      />
                      {errors.date ? <p className="mt-2 text-sm text-danger">{errors.date}</p> : null}
                    </div>
                    <div>
                      <label htmlFor="booking-time" className="mb-2 block text-sm font-medium text-ink">
                        Start time
                      </label>
                      <select
                        id="booking-time"
                        value={draft.time}
                        onChange={handleTimeChange}
                        className={fieldClasses}
                      >
                        <option value="">Select a time</option>
                        {BOOKING_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {formatTimeSlot(slot)}
                          </option>
                        ))}
                      </select>
                      {errors.time ? <p className="mt-2 text-sm text-danger">{errors.time}</p> : null}
                    </div>
                  </div>
                </>
              ) : null}

              {step === 'address' ? (
                <div>
                  <label htmlFor="booking-address" className="mb-2 block text-sm font-medium text-ink">
                    Service address
                  </label>
                  <textarea
                    id="booking-address"
                    rows={4}
                    value={draft.address}
                    onChange={handleAddressChange}
                    placeholder="Street, unit, city, and any entry notes"
                    className={`${fieldClasses} resize-y`}
                  />
                  {errors.address ? <p className="mt-2 text-sm text-danger">{errors.address}</p> : null}
                </div>
              ) : null}

              {step === 'confirm' ? (
                <dl className="space-y-3 rounded-xl border border-line bg-base p-4 text-sm">
                  <ConfirmRow label="Cleaner" value={cleaner?.name ?? 'Unknown'} />
                  <ConfirmRow label="Service" value={draft.serviceType || '—'} />
                  <ConfirmRow
                    label="When"
                    value={
                      draft.date && draft.time
                        ? `${formatBookingDate(draft.date)} at ${formatTimeSlot(draft.time)}`
                        : '—'
                    }
                  />
                  <ConfirmRow label="Address" value={draft.address || '—'} />
                  <ConfirmRow label="Rate" value={cleaner ? formatHourlyRate(cleaner.hourlyRate) : '—'} />
                  {errors.confirm ? <p className="text-danger">{errors.confirm}</p> : null}
                </dl>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                {step === 'datetime' ? (
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button type="submit">{step === 'confirm' ? 'Confirm booking' : 'Continue'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

interface ConfirmRowProps {
  label: string;
  value: string;
}

function ConfirmRow({ label, value }: ConfirmRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink sm:text-right">{value}</dd>
    </div>
  );
}
