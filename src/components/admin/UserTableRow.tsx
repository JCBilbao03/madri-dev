import { useCallback, type MouseEvent } from 'react';

import { AdminAvatar } from '@/components/admin/AdminAvatar';
import { AdminStatusDot } from '@/components/admin/AdminStatusDot';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/rental';

function isRowControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('button, a, input, select, textarea, [role="menu"]'));
}

interface UserTableRowProps {
  user: UserProfile;
  selected?: boolean;
  onSelect?: (uid: string, selected: boolean) => void;
}

export function UserTableRow({ user, selected = false, onSelect }: UserTableRowProps) {
  const handleSelectChange = () => {
    onSelect?.(user.uid, !selected);
  };

  const interactive = Boolean(onSelect);

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLTableRowElement>) => {
      if (!onSelect || isRowControlTarget(event.target)) {
        return;
      }

      onSelect(user.uid, !selected);
    },
    [onSelect, selected, user.uid],
  );

  return (
    <tr
      onClick={interactive ? handleRowClick : undefined}
      className={cn(
        'border-t border-line transition-colors hover:bg-surface-raised/40',
        interactive && 'cursor-pointer',
      )}
    >
      {onSelect ? (
        <td className="w-10 px-3 py-3 align-middle">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelectChange}
            aria-label={`Select ${user.name}`}
            className="size-4 rounded border-line text-accent focus:ring-accent"
          />
        </td>
      ) : null}

      <td className="px-3 py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <AdminAvatar name={user.name} size="sm" />
          <span className="text-ink">{user.name}</span>
        </div>
      </td>

      <td className="max-w-[16rem] px-3 py-3 align-middle">
        <span className="break-all text-sm text-ink-muted">{user.email}</span>
      </td>

      <td className="whitespace-nowrap px-3 py-3 align-middle">
        <AdminStatusDot status={user.role} />
      </td>
    </tr>
  );
}
