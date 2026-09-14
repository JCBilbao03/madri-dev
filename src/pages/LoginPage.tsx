import { CircleAlert, Loader, LogIn } from 'lucide-react';
import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/components/rental/AuthShell';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authErrorMessage } from '@/lib/auth';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardPath } from '@/types/rental';

interface LoginValues {
  email: string;
  password: string;
}

type FieldName = keyof LoginValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY: LoginValues = { email: '', password: '' };

const fieldClasses =
  'w-full rounded-xl border bg-base px-4 py-3 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

function validate(values: LoginValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Enter the email you signed up with.';
  }

  if (!values.password) {
    errors.password = 'Enter your password.';
  }

  return errors;
}

export function LoginPage() {
  usePageMeta({
    title: `Sign in — ${BRAND_NAME}`,
    description: `Sign in to the ${BRAND_NAME} rental marketplace.`,
    robots: 'noindex, nofollow',
  });

  const fieldId = useId();
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const [values, setValues] = useState<LoginValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name as FieldName]: undefined }));
    setFormError('');
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validate(values);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      setFormError('');

      try {
        const profile = await signIn(values.email.trim(), values.password);
        void navigate(dashboardPath(profile.role), { replace: true });
      } catch (error) {
        setFormError(authErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, signIn, values],
  );

  const describedBy = (field: FieldName) => (errors[field] ? `${fieldId}-${field}-error` : undefined);

  return (
    <AuthShell title="Sign in" description="Continue to the MadriBuild rental marketplace.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
          <label htmlFor={`${fieldId}-password`} className="mb-2 block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id={`${fieldId}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy('password')}
            className={cn(fieldClasses, errors.password ? 'border-danger' : 'border-line')}
          />
          {errors.password ? (
            <p
              id={`${fieldId}-password-error`}
              className="mt-2 flex items-center gap-1.5 text-sm text-danger"
            >
              <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader className="size-4 animate-spin" aria-hidden="true" />
              Signing in
            </>
          ) : (
            <>
              <LogIn className="size-4" aria-hidden="true" />
              Sign in
            </>
          )}
        </Button>

        <p role="alert" className={cn('min-h-5 text-sm text-danger', !formError && 'sr-only')}>
          {formError}
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New here?{' '}
        <Link to="/signup" className="font-medium text-accent-soft hover:text-ink">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
