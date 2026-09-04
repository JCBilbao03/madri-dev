import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApplicationAnswers } from '@/components/rental/ApplicationAnswers';
import { StatusBadge } from '@/components/rental/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { authErrorMessage } from '@/lib/auth';
import { fetchProperties, fetchTenantApplications, updateApplicationStatus } from '@/lib/rentalData';
import { useAuthStore } from '@/store/useAuthStore';
import type { Property, RentalApplication } from '@/types/rental';

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
  onWithdraw: (applicationId: string) => void;
}

function ApplicationRow({ application, title, onWithdraw }: ApplicationRowProps) {
  const handleWithdraw = useCallback(() => {
    onWithdraw(application.applicationId);
  }, [application.applicationId, onWithdraw]);

  const canWithdraw = application.status === 'pending' || application.status === 'reviewing';

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
        {canWithdraw ? (
          <Button size="sm" variant="secondary" onClick={handleWithdraw}>
            Withdraw
          </Button>
        ) : null}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-base p-4">
        <ApplicationAnswers answers={application.answers} />
      </div>
    </li>
  );
}

export function MyApplicationsPage() {
  const uid = useAuthStore((state) => state.user?.uid);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!uid) {
      return;
    }

    const [listings, apps] = await Promise.all([fetchProperties(), fetchTenantApplications(uid)]);
    setProperties(listings);
    setApplications(apps);
    setIsLoading(false);
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWithdraw = useCallback(async (applicationId: string) => {
    setError('');
    try {
      await updateApplicationStatus(applicationId, 'withdrawn');
      setApplications((current) =>
        current.map((item) => (item.applicationId === applicationId ? { ...item, status: 'withdrawn' } : item)),
      );
    } catch (withdrawError) {
      setError(authErrorMessage(withdrawError));
    }
  }, []);

  const handleWithdrawClick = useCallback(
    (applicationId: string) => {
      void handleWithdraw(applicationId);
    },
    [handleWithdraw],
  );

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Applications</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Your applications</h1>
        <p className="mt-3 max-w-xl text-ink-muted">Track status and withdraw if you have changed your mind.</p>

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading applications…</p>
        ) : applications.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-sm text-ink-muted">You have not applied to any listings yet.</p>
            <Button className="mt-5" to="/tenant">
              Browse listings
            </Button>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {applications.map((application) => (
              <ApplicationRow
                key={application.applicationId}
                application={application}
                title={titleFor(properties, application.propertyId)}
                onWithdraw={handleWithdrawClick}
              />
            ))}
          </ul>
        )}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Container>
    </main>
  );
}
