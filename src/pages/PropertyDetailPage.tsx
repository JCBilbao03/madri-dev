import { ArrowLeft, Heart, MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApplicationAnswers } from '@/components/rental/ApplicationAnswers';
import { ApplicationForm } from '@/components/rental/ApplicationForm';
import { PropertyGallery } from '@/components/rental/PropertyGallery';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import {
  useRentalActiveRole,
  useRentalIsDemo,
  useRentalSavedIds,
  useRentalScreeningOverrides,
  useRentalSubmitApplication,
  useRentalToggleSaved,
} from '@/hooks/useRentalSession';
import { authErrorMessage } from '@/lib/auth';
import { DEMO_TENANT_ID, mergeDemoApplications, mergeDemoProperties } from '@/lib/rentalDemo';
import { fetchApplicationForProperty, fetchProperty, formatRent } from '@/lib/rentalData';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useRentalDemoStore } from '@/store/useRentalDemoStore';
import type { ApplicationAnswer, Property, RentalApplication } from '@/types/rental';

export function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const user = useAuthStore((state) => state.user);
  const activeRole = useRentalActiveRole();
  const isDemo = useRentalIsDemo();
  const demoApplications = useRentalDemoStore((state) => state.applications);
  const screeningOverrides = useRentalScreeningOverrides();
  const savedIds = useRentalSavedIds();
  const toggleSavedProperty = useRentalToggleSaved();
  const submitApplication = useRentalSubmitApplication();
  const [property, setProperty] = useState<Property | null>(null);
  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const mergedDemoApplications = useMemo(
    () => mergeDemoApplications(demoApplications),
    [demoApplications],
  );

  useEffect(() => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      const listing = await fetchProperty(propertyId);
      const resolvedListing = listing
        ? mergeDemoProperties([listing], screeningOverrides)[0] ?? null
        : null;

      let existing: RentalApplication | null = null;
      if (user?.uid && activeRole === 'tenant') {
        existing = await fetchApplicationForProperty(user.uid, propertyId);
      } else if (isDemo && activeRole === 'tenant') {
        existing =
          mergedDemoApplications.find(
            (entry) => entry.propertyId === propertyId && entry.tenantId === DEMO_TENANT_ID,
          ) ?? null;
      }

      if (active) {
        setProperty(resolvedListing);
        setApplication(existing);
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [activeRole, isDemo, mergedDemoApplications, propertyId, screeningOverrides, user?.uid]);

  const isSaved = propertyId ? savedIds.includes(propertyId) : false;
  const isTenantView = activeRole === 'tenant';
  const isLandlordView = activeRole === 'landlord';

  const handleSave = useCallback(() => {
    if (propertyId) {
      toggleSavedProperty(propertyId);
    }
  }, [propertyId, toggleSavedProperty]);

  const handleApply = useCallback(
    async (answers: ApplicationAnswer[]) => {
      if (!property) {
        return;
      }

      setIsApplying(true);
      setError('');
      setMessage('');

      try {
        const created = await submitApplication(property.propertyId, answers);
        setApplication(created);
        setMessage('Application sent. The landlord will review your answers shortly.');
      } catch (applyError) {
        setError(authErrorMessage(applyError));
      } finally {
        setIsApplying(false);
      }
    },
    [property, submitApplication],
  );

  if (isLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-base text-sm text-ink-muted">
        Loading listing…
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-svh bg-base pb-16">
        <Container>
          <h1 className="font-display text-2xl font-semibold text-ink">Listing not found</h1>
          <Button className="mt-6" variant="secondary" to={isLandlordView ? '/landlord' : '/tenant'}>
            Back to listings
          </Button>
        </Container>
      </main>
    );
  }

  const backTo = isLandlordView ? '/landlord' : '/tenant';
  const questions = property.screeningQuestions;

  return (
    <main id="main" className="min-h-svh bg-base pb-16">
      <Container className="max-w-3xl">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <PropertyGallery title={property.title} photos={property.photos} />

          <div className="p-6 sm:p-8">
            <p className="text-sm font-medium capitalize text-accent-soft">{property.status}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{property.title}</h1>
            <p className="mt-3 flex items-start gap-1.5 text-ink-muted">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
              {property.address}
            </p>
            <p className="mt-6 text-base leading-relaxed text-ink-muted">{property.description}</p>
            <p className="mt-6 font-display text-3xl font-semibold text-ink">
              {formatRent(property.price)}
              <span className="ml-2 text-base font-normal text-ink-muted">/ month</span>
            </p>

            {isLandlordView ? (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold text-ink">Tenant questions</h2>
                {questions.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-muted">
                    Applicants cannot apply until you publish screening questions.
                  </p>
                ) : (
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
                    {questions.map((question) => (
                      <li key={question.id}>{question.prompt}</li>
                    ))}
                  </ol>
                )}
                <Button className="mt-5" variant="secondary" to={`/landlord/listings/${property.propertyId}/questions`}>
                  Edit questions
                </Button>
              </div>
            ) : null}

            {isTenantView ? (
              <div className="mt-8">
                <Button size="lg" variant="secondary" onClick={handleSave}>
                  <Heart className={cn('size-4', isSaved && 'fill-current')} aria-hidden="true" />
                  {isSaved ? 'Saved' : 'Save listing'}
                </Button>

                {application ? (
                  <div className="mt-8 rounded-2xl border border-line bg-base p-5">
                    <p className="text-sm font-medium capitalize text-accent-soft">Applied · {application.status}</p>
                    <div className="mt-4">
                      <ApplicationAnswers answers={application.answers} />
                    </div>
                  </div>
                ) : questions.length === 0 ? (
                  <p className="mt-6 text-sm text-ink-muted">
                    This listing is not accepting applications until the landlord publishes screening questions.
                  </p>
                ) : (
                  <ApplicationForm questions={questions} isSubmitting={isApplying} onSubmit={handleApply} />
                )}
              </div>
            ) : null}

            <p role="status" className={cn('mt-4 min-h-5 text-sm', error ? 'text-danger' : 'text-accent-soft')}>
              {error || message}
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
