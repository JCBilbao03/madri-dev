import { ArrowLeft, Loader } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ScreeningQuestionEditor } from '@/components/rental/ScreeningQuestionEditor';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useRentalScreeningOverrides, useRentalUpdateScreeningQuestions } from '@/hooks/useRentalSession';
import { authErrorMessage } from '@/lib/auth';
import { mergeDemoProperties } from '@/lib/rentalDemo';
import { fetchProperty } from '@/lib/rentalData';
import {
  DEFAULT_SCREENING_QUESTIONS,
  MAX_SCREENING_PROMPT,
  MAX_SCREENING_QUESTIONS,
  MIN_SCREENING_PROMPT,
  type Property,
  type ScreeningQuestion,
} from '@/types/rental';

function validateQuestions(questions: ScreeningQuestion[]): string {
  if (questions.length < 1) {
    return 'Add at least one question.';
  }

  if (questions.length > MAX_SCREENING_QUESTIONS) {
    return `You can ask up to ${MAX_SCREENING_QUESTIONS} questions.`;
  }

  for (const question of questions) {
    const prompt = question.prompt.trim();
    if (prompt.length < MIN_SCREENING_PROMPT) {
      return `Each question needs at least ${MIN_SCREENING_PROMPT} characters.`;
    }
    if (prompt.length > MAX_SCREENING_PROMPT) {
      return `Keep each question under ${MAX_SCREENING_PROMPT} characters.`;
    }
  }

  return '';
}

export function ListingQuestionsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const screeningOverrides = useRentalScreeningOverrides();
  const updateScreeningQuestions = useRentalUpdateScreeningQuestions();
  const [property, setProperty] = useState<Property | null>(null);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(DEFAULT_SCREENING_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    let active = true;

    void fetchProperty(propertyId).then((listing) => {
      if (!active) {
        return;
      }

      const resolved = listing ? mergeDemoProperties([listing], screeningOverrides)[0] ?? null : null;
      setProperty(resolved);
      if (resolved && resolved.screeningQuestions.length > 0) {
        setQuestions(resolved.screeningQuestions);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [propertyId, screeningOverrides]);

  const handleSubmit = useCallback(async () => {
    if (!property) {
      return;
    }

    const nextQuestions = questions.map((question) => ({
      ...question,
      prompt: question.prompt.trim(),
    }));
    const nextError = validateQuestions(nextQuestions);
    if (nextError) {
      setError(nextError);
      setMessage('');
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await updateScreeningQuestions(property.propertyId, nextQuestions);
      setQuestions(nextQuestions);
      setMessage('Tenant questions saved. Applicants must answer them to apply.');
    } catch (saveError) {
      setError(authErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }, [property, questions, updateScreeningQuestions]);

  const handleSaveClick = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  if (isLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-base text-sm text-ink-muted">
        Loading questions…
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-svh bg-base pb-16">
        <Container>
          <h1 className="font-display text-2xl font-semibold text-ink">Listing not found</h1>
          <Button className="mt-6" variant="secondary" to="/landlord">
            Back to dashboard
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-svh bg-base pb-16">
      <Container className="max-w-3xl">
        <Link to="/landlord" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <p className="mt-6 text-sm font-medium text-accent-soft">Tenant questions</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{property.title}</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Tenants must answer every question before they can apply for this listing.
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <ScreeningQuestionEditor questions={questions} onChange={setQuestions} disabled={isSaving} />
          <Button className="mt-6" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader className="size-4 animate-spin" aria-hidden="true" />
                Saving
              </>
            ) : (
              'Save questions'
            )}
          </Button>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-accent-soft">{message}</p> : null}
        </div>
      </Container>
    </main>
  );
}
