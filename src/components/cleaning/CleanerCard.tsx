import { MapPin, Star } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatHourlyRate } from '@/lib/cleaning';
import { useBookingStore } from '@/store/useBookingStore';
import type { Cleaner } from '@/types/cleaning';

interface CleanerCardProps {
  cleaner: Cleaner;
}

export function CleanerCard({ cleaner }: CleanerCardProps) {
  const openBooking = useBookingStore((state) => state.openBooking);
  const handleBook = useCallback(() => {
    openBooking(cleaner.id);
  }, [cleaner.id, openBooking]);

  const visibleServices = cleaner.services.slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:border-accent/50 hover:bg-surface-raised">
      <Link to={`/cleaning-app/cleaner/${cleaner.id}`} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-surface-raised">
          <img
            src={cleaner.photo}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent-soft uppercase">
                {cleaner.kind === 'agency' ? 'Agency' : 'Solo'}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">{cleaner.name}</h3>
            </div>
            <p className="shrink-0 text-sm font-medium text-ink">{formatHourlyRate(cleaner.hourlyRate)}</p>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {cleaner.location}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <Star className="size-3.5 shrink-0 text-accent-soft" aria-hidden="true" />
            {cleaner.rating.toFixed(1)}
            <span>({cleaner.reviewCount} reviews)</span>
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {visibleServices.map((service) => (
              <li
                key={service}
                className="rounded-full border border-line bg-base px-2.5 py-1 text-xs font-medium text-ink-muted"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-3 px-5 pt-4 pb-5">
        <Link
          to={`/cleaning-app/cleaner/${cleaner.id}`}
          className="text-sm font-medium text-accent-soft transition hover:text-accent"
        >
          View profile
        </Link>
        <Button size="sm" onClick={handleBook}>
          Book now
        </Button>
      </div>
    </article>
  );
}
