import { LeadCard } from '@/components/admin/LeadCard';
import { LeadEmptyState } from '@/components/admin/LeadEmptyState';
import { LeadTableRow } from '@/components/admin/LeadTableRow';
import { cn } from '@/lib/utils';
import type { Lead, LeadAdminOption, LeadStatus } from '@/types/admin';

const BASE_COLUMNS = ['Date', 'Lead', 'Email', 'App', 'Source', 'Summary', 'Reach out', 'Status', 'Assignee'] as const;

interface LeadTableProps {
  leads: Lead[];
  admins?: LeadAdminOption[];
  hasActiveFilters?: boolean;
  onStatus?: (leadId: string, status: LeadStatus) => void | Promise<void>;
  onAssignee?: (leadId: string, assigneeId: string) => void | Promise<void>;
  onFollowUp?: (leadId: string, followUpAt: string) => void | Promise<void>;
  onEdit?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onClearFilters?: () => void;
  onAddLead?: () => void;
  emptyLabel: string;
  className?: string;
}

export function LeadTable({
  leads,
  admins,
  hasActiveFilters = false,
  onStatus,
  onAssignee,
  onFollowUp,
  onEdit,
  onNotes,
  onDelete,
  onClearFilters,
  onAddLead,
  emptyLabel: _emptyLabel,
  className,
}: LeadTableProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);
  const columns = canManage ? [...BASE_COLUMNS, 'Actions'] : [...BASE_COLUMNS];

  if (leads.length === 0) {
    return (
      <LeadEmptyState
        filtered={hasActiveFilters}
        onClearFilters={onClearFilters}
        onAddLead={onAddLead}
      />
    );
  }

  return (
    <div className={cn('min-h-0 overflow-auto', className)}>
      <ul className="divide-y divide-line lg:hidden">
        {leads.map((lead) => (
          <li key={lead.leadId}>
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
          </li>
        ))}
      </ul>

      <div className="hidden w-full lg:block">
        <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="sticky top-0 z-10 bg-base px-3 py-2 text-left text-xs font-normal text-ink-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadTableRow
                key={lead.leadId}
                lead={lead}
                admins={admins}
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
  );
}
