import { useCallback, useId, type ChangeEvent } from 'react';

import { cn } from '@/lib/utils';
import {
  APP_IDS,
  APP_LABELS,
  isAppId,
  isLeadStatus,
  LEAD_STATUSES,
  type AppId,
  type LeadAdminOption,
  type LeadStatus,
} from '@/types/admin';

export type LeadAppFilter = AppId | 'all';
export type LeadStatusFilter = LeadStatus | 'all';
export type LeadAssigneeFilter = 'all' | 'unassigned' | string;
export type LeadFollowUpFilter = 'all' | 'due';

interface LeadFiltersProps {
  appId: LeadAppFilter;
  status: LeadStatusFilter;
  assignee: LeadAssigneeFilter;
  followUp: LeadFollowUpFilter;
  query: string;
  admins: LeadAdminOption[];
  resultCount: number;
  totalCount: number;
  dueCount: number;
  hasActiveFilters: boolean;
  onAppChange: (value: LeadAppFilter) => void;
  onStatusChange: (value: LeadStatusFilter) => void;
  onAssigneeChange: (value: LeadAssigneeFilter) => void;
  onFollowUpChange: (value: LeadFollowUpFilter) => void;
  onQueryChange: (value: string) => void;
  onClearFilters: () => void;
}

const fieldClasses =
  'h-10 w-full rounded-lg border border-line bg-base px-3 text-sm text-ink focus:border-ink-muted focus:outline-none';

export function LeadFilters({
  appId,
  status,
  assignee,
  followUp,
  query,
  admins,
  resultCount,
  totalCount,
  dueCount,
  hasActiveFilters,
  onAppChange,
  onStatusChange,
  onAssigneeChange,
  onFollowUpChange,
  onQueryChange,
  onClearFilters,
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

  const handleFollowUpChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      onFollowUpChange(value === 'due' ? 'due' : 'all');
    },
    [onFollowUpChange],
  );

  const hasUnknownAssignee = assignee !== 'all' && assignee !== 'unassigned' && !admins.some((admin) => admin.uid === assignee);

  return (
    <section aria-label="Lead filters" className="mt-8 space-y-3">
      <label className="block">
        <span className="sr-only">Search leads</span>
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search"
          className={fieldClasses}
        />
      </label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="block">
          <span className="sr-only">Filter by app</span>
          <select id={`${fieldId}-app`} value={appId} onChange={handleAppChange} className={fieldClasses}>
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
          <select id={`${fieldId}-status`} value={status} onChange={handleStatusChange} className={fieldClasses}>
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
          <select id={`${fieldId}-assignee`} value={assignee} onChange={handleAssigneeChange} className={fieldClasses}>
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
        <label className="block">
          <span className="sr-only">Filter by follow-up</span>
          <select id={`${fieldId}-follow-up`} value={followUp} onChange={handleFollowUpChange} className={fieldClasses}>
            <option value="all">All follow-ups</option>
            <option value="due">Due now</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span>
          {resultCount} of {totalCount}
        </span>
        {dueCount > 0 ? (
          <span className={cn(followUp === 'due' && 'text-danger')}>{dueCount} due</span>
        ) : null}
        {hasActiveFilters ? (
          <button type="button" onClick={onClearFilters} className="text-ink hover:underline">
            Clear
          </button>
        ) : null}
      </div>
    </section>
  );
}
