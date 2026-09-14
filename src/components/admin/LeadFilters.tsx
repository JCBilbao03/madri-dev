import { useCallback, useId, type ChangeEvent } from 'react';

import { APP_IDS, APP_LABELS, isAppId, isLeadStatus, LEAD_STATUSES, type AppId, type LeadAdminOption, type LeadStatus } from '@/types/admin';

export type LeadAppFilter = AppId | 'all';
export type LeadStatusFilter = LeadStatus | 'all';
export type LeadAssigneeFilter = 'all' | 'unassigned' | string;

interface LeadFiltersProps {
  appId: LeadAppFilter;
  status: LeadStatusFilter;
  assignee: LeadAssigneeFilter;
  query: string;
  admins: LeadAdminOption[];
  onAppChange: (value: LeadAppFilter) => void;
  onStatusChange: (value: LeadStatusFilter) => void;
  onAssigneeChange: (value: LeadAssigneeFilter) => void;
  onQueryChange: (value: string) => void;
}

const selectClasses =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink focus:border-accent focus:outline-none sm:py-2.5';

export function LeadFilters({
  appId,
  status,
  assignee,
  query,
  admins,
  onAppChange,
  onStatusChange,
  onAssigneeChange,
  onQueryChange,
}: LeadFiltersProps) {
  const fieldId = useId();

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange],
  );

  const handleAppChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      if (value === 'all' || isAppId(value)) {
        onAppChange(value);
      }
    },
    [onAppChange],
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      if (value === 'all' || isLeadStatus(value)) {
        onStatusChange(value);
      }
    },
    [onStatusChange],
  );

  const handleAssigneeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onAssigneeChange(event.target.value);
    },
    [onAssigneeChange],
  );

  const hasUnknownAssignee = assignee !== 'all' && assignee !== 'unassigned' && !admins.some((admin) => admin.uid === assignee);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:mt-8">
      <label className="block">
        <span className="sr-only">Search leads</span>
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search name, email, or summary"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none sm:py-2.5"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="sr-only">Filter by app</span>
          <select id={`${fieldId}-app`} value={appId} onChange={handleAppChange} className={selectClasses}>
            <option value="all">All apps</option>
            {APP_IDS.map((id) => (
              <option key={id} value={id}>
                {APP_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Filter by status</span>
          <select
            id={`${fieldId}-status`}
            value={status}
            onChange={handleStatusChange}
            className={selectClasses}
          >
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((id) => (
              <option key={id} value={id}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Filter by assignee</span>
          <select
            id={`${fieldId}-assignee`}
            value={assignee}
            onChange={handleAssigneeChange}
            className={selectClasses}
          >
            <option value="all">All assignees</option>
            <option value="unassigned">Unassigned</option>
            {hasUnknownAssignee ? <option value={assignee}>Assigned</option> : null}
            {admins.map((admin) => (
              <option key={admin.uid} value={admin.uid}>
                {admin.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
