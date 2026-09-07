import { useEffect, useMemo, useState } from 'react';

import { UserFilters, type UserRoleFilter } from '@/components/admin/UserFilters';
import { UserRow } from '@/components/admin/UserRow';
import { Container } from '@/components/ui/Container';
import { fetchUsers } from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
import type { UserProfile } from '@/types/rental';

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [role, setRole] = useState<UserRoleFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void fetchUsers()
      .then((nextUsers) => {
        if (!active) {
          return;
        }

        setUsers(nextUsers);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(authErrorMessage(loadError));
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => (role === 'all' ? users : users.filter((user) => user.role === role)),
    [role, users],
  );

  return (
    <main id="main" className="min-h-svh bg-base pt-36 pb-24 lg:pt-28 lg:pb-16">
      <Container>
        <p className="text-sm font-medium text-accent-soft">Admin</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Users</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Everyone with a Firestore profile. Roles cannot be changed from this screen.
        </p>

        <UserFilters role={role} onRoleChange={setRole} />

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-ink-muted">
            No users match this filter.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {filtered.map((user) => (
              <UserRow key={user.uid} user={user} />
            ))}
          </ul>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Container>
    </main>
  );
}
