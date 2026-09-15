import { useCallback, useEffect, useMemo, useState } from 'react';

import { ListingFilters } from '@/components/rental/ListingFilters';
import { PropertyCard } from '@/components/rental/PropertyCard';
import { Container } from '@/components/ui/Container';
import {
  useRentalDisplayName,
  useRentalSavedIds,
  useRentalScreeningOverrides,
  useRentalToggleSaved,
} from '@/hooks/useRentalSession';
import { mergeDemoProperties } from '@/lib/rentalDemo';
import { fetchProperties, filterProperties, sortProperties } from '@/lib/rentalData';
import { type ListingSort, type Property } from '@/types/rental';

export function TenantFeed() {
  const name = useRentalDisplayName();
  const savedIds = useRentalSavedIds();
  const screeningOverrides = useRentalScreeningOverrides();
  const toggleSavedProperty = useRentalToggleSaved();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [areaId, setAreaId] = useState('');
  const [sort, setSort] = useState<ListingSort>('featured');

  useEffect(() => {
    let active = true;

    void fetchProperties().then((listings) => {
      if (active) {
        setProperties(mergeDemoProperties(listings, screeningOverrides));
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [screeningOverrides]);

  const visible = useMemo(() => {
    const cap = maxPrice.trim() === '' ? null : Number(maxPrice);
    const filtered = filterProperties(
      properties,
      search,
      cap !== null && Number.isFinite(cap) ? cap : null,
      areaId,
    );
    return sortProperties(filtered, sort);
  }, [areaId, maxPrice, properties, search, sort]);

  const handleToggleSave = useCallback(
    (propertyId: string) => {
      toggleSavedProperty(propertyId);
    },
    [toggleSavedProperty],
  );

  return (
    <main id="main" className="min-h-svh bg-base pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Tenant</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          {name ? `Welcome, ${name}` : 'Welcome'}
        </h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Search U.S. listings, save homes, and apply from the listing page.
        </p>

        <ListingFilters
          search={search}
          maxPrice={maxPrice}
          areaId={areaId}
          sort={sort}
          onSearchChange={setSearch}
          onMaxPriceChange={setMaxPrice}
          onAreaChange={setAreaId}
          onSortChange={setSort}
          resultCount={visible.length}
        />

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading listings…</p>
        ) : visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-ink-muted">
            No listings match those filters.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {visible.map((property) => (
              <li key={property.propertyId}>
                <PropertyCard
                  property={property}
                  isSaved={savedIds.includes(property.propertyId)}
                  onToggleSave={handleToggleSave}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
