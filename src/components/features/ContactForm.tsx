import { CircleAlert, Loader, Send } from 'lucide-react';
import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { submitProjectInquiry, type ProjectInquiry } from '@/lib/api';
import { cn } from '@/lib/utils';

type FieldName = keyof ProjectInquiry;
type FieldErrors = Partial<Record<FieldName, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY_FORM: ProjectInquiry = { name: '', email: '', details: '', company: '' };

function validate(values: ProjectInquiry): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please tell us your name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please add an email so we can reply.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (values.details.trim().length < 20) {
    errors.details = 'A sentence or two about the project helps us give a useful answer.';
  }

  return errors;
}

const fieldClasses =
  'w-full rounded-xl border bg-base px-4 py-3 text-sm text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const fieldId = useId();
  const [values, setValues] = useState<ProjectInquiry>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setValues((current) => ({ ...current, [name]: value }));
      // Clear a field's error as soon as the visitor starts correcting it.
      setErrors((current) => ({ ...current, [name as FieldName]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validate(values);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setStatus('error');
        setStatusMessage('Please fix the highlighted fields and try again.');
        return;
      }

      setStatus('submitting');
      setStatusMessage('');

      try {
        const result = await submitProjectInquiry(values);
        setStatus('success');
        setStatusMessage(result.message);
        setValues(EMPTY_FORM);
      } catch {
        setStatus('error');
        setStatusMessage('Something went wrong on our end. Please email us directly instead.');
      }
    },
    [values],
  );

  const isSubmitting = status === 'submitting';

  const describedBy = (field: FieldName) => (errors[field] ? `${fieldId}-${field}-error` : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('relative flex flex-col gap-5', className)}>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${fieldId}-company`}>Company</label>
        <input
          id={`${fieldId}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company ?? ''}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor={`${fieldId}-name`} className="mb-2 block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id={`${fieldId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
          placeholder="Ada Lovelace"
          className={cn(fieldClasses, errors.name ? 'border-danger' : 'border-line')}
        />
        {errors.name ? (
          <p id={`${fieldId}-name-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${fieldId}-email`} className="mb-2 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email')}
          placeholder="ada@company.com"
          className={cn(fieldClasses, errors.email ? 'border-danger' : 'border-line')}
        />
        {errors.email ? (
          <p id={`${fieldId}-email-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${fieldId}-details`} className="mb-2 block text-sm font-medium text-ink">
          Project details
        </label>
        <textarea
          id={`${fieldId}-details`}
          name="details"
          rows={5}
          value={values.details}
          onChange={handleChange}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={describedBy('details')}
          placeholder="What are you building, who is it for, and when do you need it live?"
          className={cn(fieldClasses, 'resize-y', errors.details ? 'border-danger' : 'border-line')}
        />
        {errors.details ? (
          <p
            id={`${fieldId}-details-error`}
            className="mt-2 flex items-center gap-1.5 text-sm text-danger"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {errors.details}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin" aria-hidden="true" />
            Sending
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Send project brief
          </>
        )}
      </Button>

      {/* Announces success and submission failures without stealing focus. */}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          'min-h-5 text-sm',
          status === 'success' ? 'text-accent-soft' : 'text-danger',
          !statusMessage && 'sr-only',
        )}
      >
        {statusMessage}
      </p>
    </form>
  );
}
