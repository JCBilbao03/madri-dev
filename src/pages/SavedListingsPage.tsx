import { useCallback, useEffect, useState } from 'react';

import { PropertyCard } from '@/components/rental/PropertyCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { fetchProperties } from '@/lib/rentalData';
import { useAuthStore } from '@/store/useAuthStore';
import { savedIdsFromProfile, type Property } from '@/types/rental';

export function SavedListingsPage() {
  const profileData = useAuthStore((state) => state.user?.profileData);
  const toggleSavedProperty = useAuthStore((state) => state.toggleSavedProperty);
  const savedIds = savedIdsFromProfile(profileData ?? {});
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchProperties().then((listings) => {
      if (active) {
        setProperties(listings);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const saved = properties.filter((property) => savedIds.includes(property.propertyId));

  const handleToggleSave = useCallback(
    (propertyId: string) => {
      void toggleSavedProperty(propertyId);
    },
    [toggleSavedProperty],
  );

  return (
    <main id="main" className="min-h-svh bg-base pt-36 pb-16 sm:pt-28">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Saved</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Saved homes</h1>
        <p className="mt-3 max-w-xl text-ink-muted">Listings you want to come back to.</p>

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading saved homes…</p>
        ) : saved.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-sm text-ink-muted">You have not saved any listings yet.</p>
            <Button className="mt-5" to="/tenant">
              Browse listings
            </Button>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {saved.map((property) => (
              <li key={property.propertyId}>
                <PropertyCard property={property} isSaved onToggleSave={handleToggleSave} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
