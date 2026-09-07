import { FilterChip } from '@/components/admin/FilterChip';
import type { UserRole } from '@/types/rental';

export type UserRoleFilter = UserRole | 'all';

interface UserFiltersProps {
  role: UserRoleFilter;
  onRoleChange: (value: UserRoleFilter) => void;
}

const ROLE_OPTIONS: { id: UserRoleFilter; label: string }[] = [
  { id: 'all', label: 'All roles' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'landlord', label: 'Landlord' },
  { id: 'admin', label: 'Admin' },
];

export function UserFilters({ role, onRoleChange }: UserFiltersProps) {
  return (
    <div className="mt-8 -mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex rounded-full border border-line bg-base p-1" role="group" aria-label="Filter by role">
        {ROLE_OPTIONS.map((option) => (
          <FilterChip
            key={option.id}
            id={option.id}
            label={option.label}
            isActive={role === option.id}
            onSelect={onRoleChange}
          />
        ))}
      </div>
    </div>
  );
}
