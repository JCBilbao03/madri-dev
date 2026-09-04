import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApplicationAnswers } from '@/components/rental/ApplicationAnswers';
import { PropertyCard } from '@/components/rental/PropertyCard';
import { StatCard } from '@/components/rental/StatCard';
import { StatusBadge } from '@/components/rental/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { DEMO_PROPERTIES } from '@/data/demoListings';
import { authErrorMessage } from '@/lib/auth';
import { fetchApplications, fetchProperties, updateApplicationStatus } from '@/lib/rentalData';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApplicationStatus, Property, RentalApplication } from '@/types/rental';

const REVIEW_ACTIONS: ApplicationStatus[] = ['reviewing', 'accepted', 'declined'];

function titleFor(properties: Property[], propertyId: string): string {
  return properties.find((property) => property.propertyId === propertyId)?.title ?? propertyId;
}

function formatAppliedOn(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface ApplicationRowProps {
  application: RentalApplication;
  title: string;
  onStatus: (applicationId: string, status: ApplicationStatus) => void | Promise<void>;
}

function ApplicationRow({ application, title, onStatus }: ApplicationRowProps) {
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={`/properties/${application.propertyId}`} className="font-medium text-ink hover:text-accent-soft">
            {title}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            {formatAppliedOn(application.timestamp)}
            <StatusBadge status={application.status} />
          </p>
        </div>
        {application.status === 'withdrawn' ? null : (
          <div className="flex flex-wrap gap-2">
            {REVIEW_ACTIONS.map((status) => (
              <StatusButton
                key={status}
                status={status}
                current={application.status}
                applicationId={application.applicationId}
                onStatus={onStatus}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-base p-4">
        <ApplicationAnswers answers={application.answers} />
      </div>
    </li>
  );
}

interface StatusButtonProps {
  status: ApplicationStatus;
  current: ApplicationStatus;
  applicationId: string;
  onStatus: (applicationId: string, status: ApplicationStatus) => void | Promise<void>;
}

function StatusButton({ status, current, applicationId, onStatus }: StatusButtonProps) {
  const handleClick = useCallback(() => {
    void onStatus(applicationId, status);
  }, [applicationId, onStatus, status]);

  return (
    <Button size="sm" variant={current === status ? 'primary' : 'secondary'} onClick={handleClick}>
      {status}
    </Button>
  );
}

export function LandlordDashboard() {
  const name = useAuthStore((state) => state.user?.name);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void Promise.all([fetchProperties(), fetchApplications()]).then(([listings, apps]) => {
      if (!active) {
        return;
      }

      setProperties(listings.length > 0 ? listings : DEMO_PROPERTIES);
      setApplications(apps);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      listings: properties.length,
      pending: applications.filter((item) => item.status === 'pending').length,
      reviewing: applications.filter((item) => item.status === 'reviewing').length,
    }),
    [applications, properties.length],
  );

  const handleStatus = useCallback(async (applicationId: string, status: ApplicationStatus) => {
    setError('');
    try {
      await updateApplicationStatus(applicationId, status);
      setApplications((current) =>
        current.map((item) => (item.applicationId === applicationId ? { ...item, status } : item)),
      );
    } catch (statusError) {
      setError(authErrorMessage(statusError));
    }
  }, []);

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Landlord</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          {name ? `Welcome, ${name}` : 'Welcome'}
        </h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Set the questions tenants must answer, then review applications with their responses.
        </p>

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading listings…</p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Listings" value={stats.listings} />
              <StatCard label="Pending" value={stats.pending} />
              <StatCard label="In review" value={stats.reviewing} />
            </div>

            <h2 className="mt-10 font-display text-xl font-semibold text-ink">Listings</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {properties.map((property) => (
                <li key={property.propertyId}>
                  <PropertyCard property={property} />
                  <Button
                    className="mt-3 w-full"
                    variant="secondary"
                    to={`/landlord/listings/${property.propertyId}/questions`}
                  >
                    {property.screeningQuestions.length > 0
                      ? `Edit tenant questions (${property.screeningQuestions.length})`
                      : 'Set tenant questions'}
                  </Button>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-xl font-semibold text-ink">Applications</h2>
            {applications.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-ink-muted">
                No applications yet.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {applications.map((application) => (
                  <ApplicationRow
                    key={application.applicationId}
                    application={application}
                    title={titleFor(properties, application.propertyId)}
                    onStatus={handleStatus}
                  />
                ))}
              </ul>
            )}
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          </>
        )}
      </Container>
    </main>
  );
}
