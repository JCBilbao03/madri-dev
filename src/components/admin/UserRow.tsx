import type { UserProfile } from '@/types/rental';

interface UserRowProps {
  user: UserProfile;
}

export function UserRow({ user }: UserRowProps) {
  return (
    <li className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-ink">{user.name}</p>
        <p className="mt-1 break-all text-sm text-ink-muted">{user.email}</p>
      </div>
      <span className="inline-flex w-fit rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium capitalize text-ink-muted">
        {user.role}
      </span>
    </li>
  );
}
