import { useMemo, useState } from 'react';

import { BookingList } from '@/components/cleaning/BookingList';
import { DashboardTabs, type DashboardTab } from '@/components/cleaning/DashboardTabs';
import { Container } from '@/components/ui/Container';
import { isUpcomingBooking, sortBookingsByDate } from '@/lib/cleaning';
import { useBookingStore } from '@/store/useBookingStore';

export function CleaningDashboardPage() {
  const bookings = useBookingStore((state) => state.bookings);
  const [tab, setTab] = useState<DashboardTab>('user');

  const userBookings = useMemo(
    () => sortBookingsByDate(bookings.filter(isUpcomingBooking)),
    [bookings],
  );

  const cleanerBookings = useMemo(() => {
    const pending = sortBookingsByDate(bookings.filter((booking) => booking.status === 'pending'));
    const rest = sortBookingsByDate(bookings.filter((booking) => booking.status !== 'pending'));
    return [...pending, ...rest];
  }, [bookings]);

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Cleaning</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          User view shows upcoming bookings. Cleaner view is where requests are accepted or declined.
        </p>

        <div className="mt-8">
          <DashboardTabs active={tab} onChange={setTab} />
        </div>

        <section
          className="mt-8"
          role="tabpanel"
          id={`dashboard-panel-${tab}`}
          aria-labelledby={`dashboard-tab-${tab}`}
        >
          {tab === 'user' ? (
            <>
              <h2 className="sr-only">Upcoming bookings</h2>
              <BookingList
                bookings={userBookings}
                variant="user"
                emptyMessage="No upcoming bookings. Search for a cleaner to get started."
              />
            </>
          ) : (
            <>
              <h2 className="sr-only">Booking requests</h2>
              <BookingList
                bookings={cleanerBookings}
                variant="cleaner"
                emptyMessage="No requests yet. New bookings from the search flow will show up here."
              />
            </>
          )}
        </section>
      </Container>
    </main>
  );
}
