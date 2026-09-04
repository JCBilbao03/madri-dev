import { Loader, Send } from 'lucide-react';
import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  MAX_SCREENING_ANSWER,
  type ApplicationAnswer,
  type ScreeningQuestion,
} from '@/types/rental';

interface ApplicationFormProps {
  questions: ScreeningQuestion[];
  isSubmitting: boolean;
  onSubmit: (answers: ApplicationAnswer[]) => void | Promise<void>;
}

interface TextQuestionFieldProps {
  question: ScreeningQuestion;
  value: string;
  error?: string;
  onChange: (questionId: string, value: string) => void;
}

interface YesNoQuestionFieldProps {
  question: ScreeningQuestion;
  value: string;
  error?: string;
  onChange: (questionId: string, value: string) => void;
}

const fieldClasses =
  'w-full rounded-xl border bg-base px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

function TextQuestionField({ question, value, error, onChange }: TextQuestionFieldProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(question.id, event.target.value);
    },
    [onChange, question.id],
  );

  return (
    <div>
      <label htmlFor={`answer-${question.id}`} className="mb-2 block text-sm font-medium text-ink">
        {question.prompt}
      </label>
      <textarea
        id={`answer-${question.id}`}
        value={value}
        onChange={handleChange}
        rows={3}
        maxLength={MAX_SCREENING_ANSWER}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses, error ? 'border-danger' : 'border-line')}
      />
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function YesNoQuestionField({ question, value, error, onChange }: YesNoQuestionFieldProps) {
  const handleYes = useCallback(() => {
    onChange(question.id, 'yes');
  }, [onChange, question.id]);

  const handleNo = useCallback(() => {
    onChange(question.id, 'no');
  }, [onChange, question.id]);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{question.prompt}</legend>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={value === 'yes' ? 'primary' : 'secondary'} onClick={handleYes}>
          Yes
        </Button>
        <Button type="button" size="sm" variant={value === 'no' ? 'primary' : 'secondary'} onClick={handleNo}>
          No
        </Button>
      </div>
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </fieldset>
  );
}

function emptyAnswers(questions: ScreeningQuestion[]): Record<string, string> {
  return Object.fromEntries(questions.map((question) => [question.id, '']));
}

function validate(questions: ScreeningQuestion[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    const value = (values[question.id] ?? '').trim();
    if (question.type === 'yesno') {
      if (value !== 'yes' && value !== 'no') {
        errors[question.id] = 'Choose yes or no.';
      }
      continue;
    }

    if (value.length === 0) {
      errors[question.id] = 'This question needs an answer.';
    } else if (value.length > MAX_SCREENING_ANSWER) {
      errors[question.id] = `Keep this under ${MAX_SCREENING_ANSWER} characters.`;
    }
  }

  return errors;
}

export function ApplicationForm({ questions, isSubmitting, onSubmit }: ApplicationFormProps) {
  const [values, setValues] = useState(() => emptyAnswers(questions));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((questionId: string, value: string) => {
    setValues((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validate(questions, values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      const answers: ApplicationAnswer[] = questions.map((question) => ({
        questionId: question.id,
        prompt: question.prompt,
        answer: (values[question.id] ?? '').trim(),
      }));

      void onSubmit(answers);
    },
    [onSubmit, questions, values],
  );

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5" noValidate>
      <p className="text-sm font-medium text-ink">Answer the landlord’s questions to apply</p>
      {questions.map((question) =>
        question.type === 'yesno' ? (
          <YesNoQuestionField
            key={question.id}
            question={question}
            value={values[question.id] ?? ''}
            error={errors[question.id]}
            onChange={handleChange}
          />
        ) : (
          <TextQuestionField
            key={question.id}
            question={question}
            value={values[question.id] ?? ''}
            error={errors[question.id]}
            onChange={handleChange}
          />
        ),
      )}
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin" aria-hidden="true" />
            Sending
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Submit application
          </>
        )}
      </Button>
    </form>
  );
}
