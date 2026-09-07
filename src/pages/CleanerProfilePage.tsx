import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { formatHourlyRate, formatReviewDate, getCleanerById } from '@/lib/cleaning';
import { useBookingStore } from '@/store/useBookingStore';

export function CleanerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const cleaner = id ? getCleanerById(id) : undefined;
  const openBooking = useBookingStore((state) => state.openBooking);

  const handleBook = useCallback(() => {
    if (cleaner) {
      openBooking(cleaner.id);
    }
  }, [cleaner, openBooking]);

  if (!cleaner) {
    return (
      <main id="main" className="min-h-svh bg-base pt-28 pb-16">
        <Container>
          <p className="text-sm font-medium text-accent-soft">Cleaning</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Cleaner not found</h1>
          <p className="mt-3 max-w-xl text-ink-muted">This profile is not on the list. Head back to search and pick another.</p>
          <Button className="mt-8" variant="secondary" to="/cleaning-app">
            Back to search
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container>
        <Link
          to="/cleaning-app"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="aspect-[16/9] bg-surface-raised">
                <img
                  src={cleaner.photo}
                  alt=""
                  className="size-full object-cover"
                  decoding="async"
                />
              </div>
            </div>

            <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-accent-soft uppercase">
              {cleaner.kind === 'agency' ? 'Agency' : 'Solo freelancer'}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {cleaner.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {cleaner.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3.5 text-accent-soft" aria-hidden="true" />
                {cleaner.rating.toFixed(1)} ({cleaner.reviewCount} reviews)
              </span>
            </p>
            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-ink-muted">{cleaner.bio}</p>

            <h2 className="mt-10 font-display text-xl font-semibold text-ink">Services</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cleaner.services.map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-muted"
                >
                  {service}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl font-semibold text-ink">Reviews</h2>
            <ul className="mt-4 space-y-4">
              {cleaner.reviews.map((review) => (
                <li key={review.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">{review.author}</p>
                    <p className="text-sm text-ink-muted">{formatReviewDate(review.date)}</p>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                    <Star className="size-3.5 text-accent-soft" aria-hidden="true" />
                    {review.rating.toFixed(1)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{review.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:pt-0">
            <div className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-28">
              <p className="text-sm text-ink-muted">Hourly rate</p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
                {formatHourlyRate(cleaner.hourlyRate)}
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                Pick a date, add the address, and the request lands on the cleaner dashboard as pending.
              </p>
              <Button className="mt-6 w-full" size="lg" onClick={handleBook}>
                Book now
              </Button>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
