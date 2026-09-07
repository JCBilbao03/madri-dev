import { LeadCard } from '@/components/admin/LeadCard';
import { LeadTableRow } from '@/components/admin/LeadTableRow';
import type { Lead, LeadAdminOption, LeadStatus } from '@/types/admin';

const BASE_COLUMNS = ['Date', 'Name', 'Email', 'App', 'Source', 'Summary', 'Status', 'Assignee'] as const;

interface LeadTableProps {
  leads: Lead[];
  admins?: LeadAdminOption[];
  onStatus?: (leadId: string, status: LeadStatus) => void | Promise<void>;
  onAssignee?: (leadId: string, assigneeId: string) => void | Promise<void>;
  onEdit?: (lead: Lead) => void;
  onNotes?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  emptyLabel: string;
}

export function LeadTable({
  leads,
  admins,
  onStatus,
  onAssignee,
  onEdit,
  onNotes,
  onDelete,
  emptyLabel,
}: LeadTableProps) {
  const canManage = Boolean(onEdit && onNotes && onDelete);
  const columns = canManage ? [...BASE_COLUMNS, 'Actions'] : [...BASE_COLUMNS];

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted sm:p-10">
        {emptyLabel}
      </p>
    );
  }

  return (
    <>
      <ul className="grid gap-3 lg:hidden">
        {leads.map((lead) => (
          <li key={lead.leadId}>
            <LeadCard
              lead={lead}
              admins={admins}
              onStatus={onStatus}
              onAssignee={onAssignee}
              onEdit={onEdit}
              onNotes={onNotes}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface lg:block">
        <table className="min-w-[80rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface-raised">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="sticky top-0 border-b border-line px-3 py-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase"
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
                onEdit={onEdit}
                onNotes={onNotes}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
