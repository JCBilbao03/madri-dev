import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminPage } from '@/components/admin/AdminPage';
import { UserFilters, type UserRoleFilter } from '@/components/admin/UserFilters';
import { UserTable } from '@/components/admin/UserTable';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import { fetchUsers } from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
import type { UserProfile } from '@/types/rental';

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [role, setRole] = useState<UserRoleFilter>('all');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Users' }, { label: 'Table' }],
      showSearch: true,
      searchQuery: query,
      searchPlaceholder: 'Search users…',
      onSearchChange: setQuery,
    }),
    [query],
  );

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === 'all' || user.role === role;
      const matchesQuery =
        needle.length === 0 ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle);
      return matchesRole && matchesQuery;
    });
  }, [query, role, users]);

  const handleRoleChange = useCallback((value: UserRoleFilter) => {
    setRole(value);
  }, []);

  return (
    <AdminPage>
      <div className="mx-auto w-full max-w-6xl">
        <UserFilters role={role} onRoleChange={handleRoleChange} />

        {isLoading ? (
          <p className="mt-8 text-sm text-ink-muted">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-ink-muted">
            No users match this filter.
          </p>
        ) : (
          <div className="mt-6">
            <UserTable users={filtered} />
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    </AdminPage>
  );
}
