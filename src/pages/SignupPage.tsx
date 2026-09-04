import { CircleAlert, Loader, UserPlus } from 'lucide-react';
import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/components/rental/AuthShell';
import { Button } from '@/components/ui/Button';
import { authErrorMessage } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardPath, isUserRole, type UserRole } from '@/types/rental';

interface SignupValues {
  name: string;
  email: string;
  password: string;
  role: UserRole | '';
}

type FieldName = keyof SignupValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY: SignupValues = { name: '', email: '', password: '', role: '' };

const fieldClasses =
  'w-full rounded-xl border bg-base px-4 py-3 text-sm text-ink transition placeholder:text-ink-muted/60 focus:border-accent focus:outline-none';

function validate(values: SignupValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Tell us your name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please add an email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (values.password.length < 6) {
    errors.password = 'Use at least six characters.';
  }

  if (!isUserRole(values.role)) {
    errors.role = 'Choose whether you are renting or listing.';
  }

  return errors;
}

export function SignupPage() {
  const fieldId = useId();
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [values, setValues] = useState<SignupValues>(EMPTY);
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

      if (Object.keys(nextErrors).length > 0 || !isUserRole(values.role)) {
        return;
      }

      setIsSubmitting(true);
      setFormError('');

      try {
        const profile = await signUp({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
        });
        void navigate(dashboardPath(profile.role), { replace: true });
      } catch (error) {
        setFormError(authErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, signUp, values],
  );

  const describedBy = (field: FieldName) => (errors[field] ? `${fieldId}-${field}-error` : undefined);

  return (
    <AuthShell title="Create an account" description="Join as a tenant looking for a place, or as a landlord listing one.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
            autoComplete="new-password"
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

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">I am a</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-describedby={describedBy('role')}>
            {(['tenant', 'landlord'] as const).map((role) => (
              <label
                key={role}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium capitalize transition',
                  values.role === role
                    ? 'border-accent bg-accent/10 text-ink'
                    : 'border-line bg-base text-ink-muted hover:border-accent/50',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={values.role === role}
                  onChange={handleChange}
                  className="sr-only"
                />
                {role}
              </label>
            ))}
          </div>
          {errors.role ? (
            <p id={`${fieldId}-role-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
              <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.role}
            </p>
          ) : null}
        </fieldset>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader className="size-4 animate-spin" aria-hidden="true" />
              Creating account
            </>
          ) : (
            <>
              <UserPlus className="size-4" aria-hidden="true" />
              Create account
            </>
          )}
        </Button>

        <p role="alert" className={cn('min-h-5 text-sm text-danger', !formError && 'sr-only')}>
          {formError}
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-soft hover:text-ink">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
