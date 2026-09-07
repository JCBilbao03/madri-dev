import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatBookingDate, formatHourlyRate, formatTimeSlot } from '@/lib/cleaning';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/store/useBookingStore';
import type { Booking, BookingStatus } from '@/types/cleaning';

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'border-accent/40 bg-accent/10 text-accent-soft',
  accepted: 'border-accent-alt/40 bg-accent-alt/10 text-accent-alt',
  declined: 'border-danger/40 bg-danger/10 text-danger',
};

interface BookingListProps {
  bookings: Booking[];
  variant: 'user' | 'cleaner';
  emptyMessage: string;
}

interface BookingRowProps {
  booking: Booking;
  variant: 'user' | 'cleaner';
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function BookingRow({ booking, variant }: BookingRowProps) {
  const acceptBooking = useBookingStore((state) => state.acceptBooking);
  const declineBooking = useBookingStore((state) => state.declineBooking);

  const handleAccept = useCallback(() => {
    acceptBooking(booking.id);
  }, [acceptBooking, booking.id]);

  const handleDecline = useCallback(() => {
    declineBooking(booking.id);
  }, [booking.id, declineBooking]);

  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={`/cleaning-app/cleaner/${booking.cleanerId}`}
            className="font-medium text-ink hover:text-accent-soft"
          >
            {booking.cleanerName}
          </Link>
          <p className="mt-1 text-sm text-ink-muted">
            {booking.serviceType} · {formatHourlyRate(booking.hourlyRate)}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            {formatBookingDate(booking.date)} at {formatTimeSlot(booking.time)}
            <StatusBadge status={booking.status} />
          </p>
          <p className="mt-2 text-sm text-ink-muted">{booking.address}</p>
        </div>

        {variant === 'cleaner' && booking.status === 'pending' ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Accept
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function BookingList({ bookings, variant, emptyMessage }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-5 py-10 text-center">
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} variant={variant} />
      ))}
    </ul>
  );
}
