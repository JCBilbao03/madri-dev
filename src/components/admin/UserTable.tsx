import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminStatusDot } from '@/components/admin/AdminStatusDot';
import { UserTableRow } from '@/components/admin/UserTableRow';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/rental';

const DEFAULT_PAGE_SIZE = 10;

interface UserTableProps {
  users: UserProfile[];
  pageSize?: number;
  className?: string;
}

export function UserTable({ users, pageSize = DEFAULT_PAGE_SIZE, className }: UserTableProps) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [page, pageSize, users]);

  const allPageSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedIds.has(user.uid));

  const handleSelectAll = useCallback(() => {
    const next = new Set(selectedIds);
    if (allPageSelected) {
      paginatedUsers.forEach((user) => next.delete(user.uid));
    } else {
      paginatedUsers.forEach((user) => next.add(user.uid));
    }
    setSelectedIds(next);
  }, [allPageSelected, paginatedUsers, selectedIds]);

  const handleSelect = useCallback((uid: string, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(uid);
      } else {
        next.delete(uid);
      }
      return next;
    });
  }, []);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-line bg-surface', className)}>
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <ul className="divide-y divide-line lg:hidden">
          {paginatedUsers.map((user) => (
            <li
              key={user.uid}
              className="flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-raised/40"
              onClick={(event) => {
                const target = event.target;
                if (target instanceof HTMLElement && target.closest('input, button, a, select, textarea')) {
                  return;
                }

                handleSelect(user.uid, !selectedIds.has(user.uid));
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(user.uid)}
                onChange={() => handleSelect(user.uid, !selectedIds.has(user.uid))}
                aria-label={`Select ${user.name}`}
                className="mt-1 size-4 shrink-0 rounded border-line text-accent focus:ring-accent"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AdminAvatar name={user.name} size="sm" />
                  <p className="text-ink">{user.name}</p>
                </div>
                <p className="mt-1 break-all text-sm text-ink-muted">{user.email}</p>
                <div className="mt-2">
                  <AdminStatusDot status={user.role} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <table className="admin-data-table hidden w-full min-w-[36rem] border-collapse text-left text-sm lg:table">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all users on this page"
                  className="size-4 rounded border-line text-accent focus:ring-accent"
                />
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-ink-muted uppercase">
                User
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-ink-muted uppercase">
                Email
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-ink-muted uppercase">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <UserTableRow
                key={user.uid}
                user={user}
                selected={selectedIds.has(user.uid)}
                onSelect={handleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination page={page} pageSize={pageSize} totalItems={users.length} onPageChange={setPage} />
    </div>
  );
}
