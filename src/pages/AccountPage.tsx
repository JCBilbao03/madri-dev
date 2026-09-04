import { CircleAlert, Loader } from 'lucide-react';
import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { authErrorMessage } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { savedIdsFromProfile } from '@/types/rental';

export function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const updateName = useAuthStore((state) => state.updateName);
  const fieldId = useId();
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setError('');
    setMessage('');
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!name.trim()) {
        setError('Name cannot be empty.');
        return;
      }

      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        await updateName(name);
        setMessage('Profile updated.');
      } catch (saveError) {
        setError(authErrorMessage(saveError));
      } finally {
        setIsSaving(false);
      }
    },
    [name, updateName],
  );

  return (
    <main id="main" className="min-h-svh bg-base pt-28 pb-16">
      <Container className="max-w-xl">
        <p className="text-sm font-medium text-accent-soft">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Your profile</h1>
        <p className="mt-3 text-ink-muted">This name is shown on the dashboards you use in the rental app.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-line bg-surface p-6" noValidate>
          <div>
            <label htmlFor={`${fieldId}-email`} className="mb-2 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id={`${fieldId}-email`}
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink-muted"
            />
          </div>

          <div className="mt-5">
            <label htmlFor={`${fieldId}-name`} className="mb-2 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id={`${fieldId}-name`}
              name="name"
              type="text"
              value={name}
              onChange={handleChange}
              aria-invalid={Boolean(error)}
              className={cn(
                'w-full rounded-xl border bg-base px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none',
                error ? 'border-danger' : 'border-line',
              )}
            />
          </div>

          <p className="mt-3 text-sm capitalize text-ink-muted">Role: {user?.role}</p>
          {user?.role === 'tenant' ? (
            <p className="mt-1 text-sm text-ink-muted">
              Saved homes: {savedIdsFromProfile(user.profileData).length}
            </p>
          ) : null}

          <Button type="submit" className="mt-6" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader className="size-4 animate-spin" aria-hidden="true" />
                Saving
              </>
            ) : (
              'Save changes'
            )}
          </Button>

          {error ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              {error}
            </p>
          ) : null}
          {message ? <p className="mt-3 text-sm text-accent-soft">{message}</p> : null}
        </form>
      </Container>
    </main>
  );
}
