import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminBulkActionBar } from '@/components/admin/AdminBulkActionBar';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { LeadCard } from '@/components/admin/LeadCard';
import { LeadEmptyState } from '@/components/admin/LeadEmptyState';
import { LeadTableRow } from '@/components/admin/LeadTableRow';
import { cn } from '@/lib/utils';
import type { Lead, LeadAdminOption, LeadStatus } from '@/types/admin';

const DEFAULT_PAGE_SIZE = 10;

interface LeadTableProps {
  leads: Lead[];
  admins?: LeadAdminOption[];
  compact?: boolean;
  /** When false, all rows render in a scrollable panel (no page controls). */
  paginate?: boolean;
  pageSize?: number;
  hasActiveFilters?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onBulkStatus?: (leadIds: string[], status: LeadStatus) => void | Promise<void>;
  onBulkDelete?: (leadIds: string[]) => void | Promise<void>;
  onBulkMail?: (leadIds: string[]) => void;
  onStatus?: (leadId: string, status: LeadStatus) => void | Promise<void>;
  onAssignee?: (leadId: string, assigneeId: string) => void | Promise<void>;
  onFollowUp?: (leadId: string, followUpAt: string) => void | Promise<void>;
  onEdit?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onClearFilters?: () => void;
  onAddLead?: () => void;
  onImport?: () => void;
  emptyLabel: string;
  className?: string;
}

function buildColumns(compact: boolean, canManage: boolean, selectable: boolean): string[] {
  const columns = ['Lead'];
  if (!compact) {
    columns.push('Owner', 'Source');
  }
  columns.push('Status', 'Created');
  if (canManage) {
    columns.push('Actions');
  }
  if (selectable) {
    return ['', ...columns];
  }
  return columns;
}

export function LeadTable({
  leads,
  admins,
  compact = false,
  paginate = true,
  pageSize = DEFAULT_PAGE_SIZE,
  hasActiveFilters = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onBulkStatus,
  onBulkDelete,
  onBulkMail,
  onStatus,
  onAssignee,
  onFollowUp,
  onEdit,
  onNotes,
  onDelete,
  onClearFilters,
  onAddLead,
  onImport,
  emptyLabel: _emptyLabel,
  className,
}: LeadTableProps) {
  const [page, setPage] = useState(1);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());

  const selectable = Boolean(onSelectionChange || controlledSelectedIds);
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;

  const canManage = Boolean(onEdit && onNotes && onDelete);
  const columns = buildColumns(compact, canManage, selectable);

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedLeads = useMemo(() => {
    if (!paginate) {
      return leads;
    }

    const start = (page - 1) * pageSize;
    return leads.slice(start, start + pageSize);
  }, [leads, page, pageSize, paginate]);

  const visibleLeads = paginatedLeads;

  const allPageSelected =
    visibleLeads.length > 0 && visibleLeads.every((lead) => selectedIds.has(lead.leadId));

  const handleSelectAll = useCallback(() => {
    const next = new Set(selectedIds);
    if (allPageSelected) {
      visibleLeads.forEach((lead) => next.delete(lead.leadId));
    } else {
      visibleLeads.forEach((lead) => next.add(lead.leadId));
    }
    setSelectedIds(next);
  }, [allPageSelected, selectedIds, setSelectedIds, visibleLeads]);

  const handleSelect = useCallback(
    (leadId: string, selected: boolean) => {
      const next = new Set(selectedIds);
      if (selected) {
        next.add(leadId);
      } else {
        next.delete(leadId);
      }
      setSelectedIds(next);
    },
    [selectedIds, setSelectedIds],
  );

  const handleUnselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, [setSelectedIds]);

  const handleBulkStatus = useCallback(
    (status: LeadStatus) => {
      if (!onBulkStatus) {
        return;
      }
      void onBulkStatus(Array.from(selectedIds), status);
      setSelectedIds(new Set());
    },
    [onBulkStatus, selectedIds, setSelectedIds],
  );

  const handleBulkDelete = useCallback(() => {
    if (!onBulkDelete) {
      return;
    }
    void onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [onBulkDelete, selectedIds, setSelectedIds]);

  const handleBulkMail = useCallback(() => {
    onBulkMail?.(Array.from(selectedIds));
  }, [onBulkMail, selectedIds]);

  if (leads.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface',
          className,
        )}
      >
        <LeadEmptyState
          filtered={hasActiveFilters}
          onClearFilters={onClearFilters}
          onAddLead={onAddLead}
          onImport={onImport}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface',
        className,
      )}
    >
      {selectable && onBulkStatus && onBulkDelete ? (
        <AdminBulkActionBar
          selectedCount={selectedIds.size}
          onUnselectAll={handleUnselectAll}
          onChangeStatus={handleBulkStatus}
          onNewMail={handleBulkMail}
          onDelete={handleBulkDelete}
          className="shrink-0"
        />
      ) : null}

      <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain [scrollbar-width:thin]">
        <ul className="divide-y divide-line lg:hidden">
          {visibleLeads.map((lead) => (
            <li key={lead.leadId} className="px-4">
              {selectable ? (
                <div className="flex items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.leadId)}
                    onChange={() => handleSelect(lead.leadId, !selectedIds.has(lead.leadId))}
                    aria-label={`Select ${lead.name}`}
                    className="mt-1 size-4 shrink-0 rounded border-line text-accent focus:ring-accent"
                  />
                  <div className="min-w-0 flex-1">
                    <LeadCard
                      lead={lead}
                      admins={admins}
                      onStatus={onStatus}
                      onAssignee={onAssignee}
                      onFollowUp={onFollowUp}
                      onEdit={onEdit}
                      onNotes={onNotes}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              ) : (
                <LeadCard
                  lead={lead}
                  admins={admins}
                  onStatus={onStatus}
                  onAssignee={onAssignee}
                  onFollowUp={onFollowUp}
                  onEdit={onEdit}
                  onNotes={onNotes}
                  onDelete={onDelete}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="hidden w-full lg:block">
          <table className="admin-data-table w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((column, index) => (
                  <th
                    key={column || 'select'}
                    scope="col"
                    className="sticky top-0 z-10 bg-surface px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-ink-muted uppercase"
                  >
                    {index === 0 && selectable ? (
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all leads on this page"
                        className="size-4 rounded border-line text-accent focus:ring-accent"
                      />
                    ) : (
                      column
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <LeadTableRow
                  key={lead.leadId}
                  lead={lead}
                  admins={admins}
                  compact={compact}
                  selected={selectedIds.has(lead.leadId)}
                  onSelect={selectable ? handleSelect : undefined}
                  onStatus={onStatus}
                  onAssignee={onAssignee}
                  onFollowUp={onFollowUp}
                  onEdit={onEdit}
                  onNotes={onNotes}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!compact && paginate ? (
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={leads.length}
          onPageChange={setPage}
          className="shrink-0"
        />
      ) : null}
    </div>
  );
}
