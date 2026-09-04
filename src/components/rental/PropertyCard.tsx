import { Heart } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { formatRent } from '@/lib/rentalData';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/rental';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
}

interface SaveButtonProps {
  title: string;
  propertyId: string;
  isSaved: boolean;
  onToggleSave: (propertyId: string) => void;
}

function SaveButton({ title, propertyId, isSaved, onToggleSave }: SaveButtonProps) {
  const handleClick = useCallback(() => {
    onToggleSave(propertyId);
  }, [onToggleSave, propertyId]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${title} from saved homes` : `Save ${title}`}
      className={cn(
        'absolute top-3 right-3 grid size-10 place-items-center rounded-full border backdrop-blur-md transition',
        isSaved
          ? 'border-accent/40 bg-base/90 text-accent-soft'
          : 'border-line bg-base/80 text-ink-muted hover:text-ink',
      )}
    >
      <Heart className={cn('size-4', isSaved && 'fill-current')} aria-hidden="true" />
    </button>
  );
}

export function PropertyCard({ property, isSaved = false, onToggleSave }: PropertyCardProps) {
  const photo = property.photos[0];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-accent/50">
      <Link to={`/properties/${property.propertyId}`} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-surface-raised">
          {photo ? (
            <img
              src={photo}
              alt={property.title}
              className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="grid size-full place-items-center text-sm text-ink-muted">No photo</div>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm font-medium capitalize text-accent-soft">{property.status}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">{property.title}</h3>
          <p className="mt-2 text-sm text-ink-muted">{property.address}</p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">{property.description}</p>
          <p className="mt-4 font-display text-xl font-semibold text-ink">
            {formatRent(property.price)}
            <span className="ml-1 text-sm font-normal text-ink-muted">/ month</span>
          </p>
        </div>
      </Link>

      {onToggleSave ? (
        <SaveButton
          title={property.title}
          propertyId={property.propertyId}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
        />
      ) : null}
    </article>
  );
}
