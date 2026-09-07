import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CleanerCard } from '@/components/cleaning/CleanerCard';
import { CleaningSearchBar } from '@/components/cleaning/CleaningSearchBar';
import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cleaners } from '@/data/cleaners';
import { filterCleaners } from '@/lib/cleaning';
import { isCleaningService, type CleaningService } from '@/types/cleaning';

export function CleaningSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const serviceParam = searchParams.get('service') ?? '';
  const service: CleaningService | '' = isCleaningService(serviceParam) ? serviceParam : '';

  const visible = useMemo(() => filterCleaners(cleaners, query, service), [query, service]);

  const handleQueryChange = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) {
        next.set('q', value);
      } else {
        next.delete('q');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleServiceChange = useCallback(
    (value: CleaningService | '') => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set('service', value);
      } else {
        next.delete('service');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Cleaning"
          title="Book a cleaner"
          titleAccent="that shows up"
          description="Search by neighborhood or job type. Solo freelancers and agencies, listed with hourly rates and recent reviews."
          headingId="cleaning-search-heading"
        />

        <div className="mt-10">
          <CleaningSearchBar
            query={query}
            service={service}
            resultCount={visible.length}
            onQueryChange={handleQueryChange}
            onServiceChange={handleServiceChange}
          />
        </div>

        {visible.length === 0 ? (
          <p className="mt-12 text-sm text-ink-muted">
            No cleaners match that search. Try a city name or a service like deep clean.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((cleaner, index) => (
              <Reveal key={cleaner.id} as="li" delay={Math.min(index, 4) * 0.07} className="h-full">
                <CleanerCard cleaner={cleaner} />
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
