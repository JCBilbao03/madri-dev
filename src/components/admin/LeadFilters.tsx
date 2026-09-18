import { X } from 'lucide-react';
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
export type LeadIndustryFilter = 'all' | string;

interface LeadFiltersProps {
  appId: LeadAppFilter;
  status: LeadStatusFilter;
  assignee: LeadAssigneeFilter;
  followUp: LeadFollowUpFilter;
  industry: LeadIndustryFilter;
  industries: string[];
  admins: LeadAdminOption[];
  resultCount: number;
  totalCount: number;
  dueCount: number;
  hasActiveFilters: boolean;
  onAppChange: (value: LeadAppFilter) => void;
  onStatusChange: (value: LeadStatusFilter) => void;
  onAssigneeChange: (value: LeadAssigneeFilter) => void;
  onFollowUpChange: (value: LeadFollowUpFilter) => void;
  onIndustryChange: (value: LeadIndustryFilter) => void;
  onClearFilters: () => void;
}

const selectClasses =
  'h-9 w-full min-w-0 rounded-lg border border-line bg-base px-2.5 text-sm text-ink transition focus:border-accent focus:outline-none';

export function LeadFilters({
  appId,
  status,
  assignee,
  followUp,
  industry,
  industries,
  admins,
  resultCount,
  totalCount,
  dueCount,
  hasActiveFilters,
  onAppChange,
  onStatusChange,
  onAssigneeChange,
  onFollowUpChange,
  onIndustryChange,
  onClearFilters,
}: LeadFiltersProps) {
  const fieldId = useId();

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

  const handleIndustryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onIndustryChange(event.target.value);
    },
    [onIndustryChange],
  );

  const hasUnknownAssignee =
    assignee !== 'all' && assignee !== 'unassigned' && !admins.some((admin) => admin.uid === assignee);

  return (
    <section
      aria-label="Lead filters"
      className="mt-4 shrink-0 rounded-xl border border-line/80 bg-surface px-3 py-3 sm:px-4"
    >
      <div className="flex flex-wrap items-end gap-2 sm:gap-3">
        <label className="min-w-[7rem] flex-1 space-y-1">
          <span className="text-[10px] font-medium tracking-wide text-ink-muted uppercase">App</span>
          <select id={`${fieldId}-app`} value={appId} onChange={handleAppChange} className={selectClasses}>
            <option value="all">All apps</option>
            {APP_IDS.map((id) => (
              <option key={id} value={id}>
                {APP_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[7rem] flex-1 space-y-1">
          <span className="text-[10px] font-medium tracking-wide text-ink-muted uppercase">Status</span>
          <select id={`${fieldId}-status`} value={status} onChange={handleStatusChange} className={selectClasses}>
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((id) => (
              <option key={id} value={id}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[7rem] flex-1 space-y-1">
          <span className="text-[10px] font-medium tracking-wide text-ink-muted uppercase">Assignee</span>
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

        <label className="min-w-[7rem] flex-1 space-y-1">
          <span className="text-[10px] font-medium tracking-wide text-ink-muted uppercase">Industry</span>
          <select
            id={`${fieldId}-industry`}
            value={industry}
            onChange={handleIndustryChange}
            className={selectClasses}
          >
            <option value="all">All industries</option>
            {industries.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[7rem] flex-1 space-y-1">
          <span className="text-[10px] font-medium tracking-wide text-ink-muted uppercase">Due</span>
          <select
            id={`${fieldId}-follow-up`}
            value={followUp}
            onChange={handleFollowUpChange}
            className={selectClasses}
          >
            <option value="all">All follow-ups</option>
            <option value="due">Due now</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-muted">
          <span className="font-medium text-ink">{resultCount}</span> of {totalCount} leads
        </span>
        {dueCount > 0 ? (
          <button
            type="button"
            onClick={() => onFollowUpChange(followUp === 'due' ? 'all' : 'due')}
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition',
              followUp === 'due'
                ? 'border-danger/40 bg-danger/10 text-danger'
                : 'border-line bg-base text-ink-muted hover:border-danger/30 hover:text-danger',
            )}
          >
            {dueCount} due now
          </button>
        ) : null}
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-base px-2.5 py-0.5 text-xs text-ink-muted transition hover:text-ink"
          >
            <X className="size-3" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
