import { FileUp, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AdminPage } from '@/components/admin/AdminPage';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { LeadEditorModal } from '@/components/admin/LeadEditorModal';
import {
  LeadFilters,
  type LeadAppFilter,
  type LeadAssigneeFilter,
  type LeadFollowUpFilter,
  type LeadIndustryFilter,
  type LeadStatusFilter,
} from '@/components/admin/LeadFilters';
import { LeadImportModal } from '@/components/admin/LeadImportModal';
import { LeadLoadingState } from '@/components/admin/LeadLoadingState';
import { LeadNotesModal } from '@/components/admin/LeadNotesModal';
import { LeadTable } from '@/components/admin/LeadTable';
import { Button } from '@/components/ui/Button';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import {
  addLeadNote,
  createLead,
  deleteLead,
  fetchAdmins,
  fetchLeads,
  updateLead,
  updateLeadAssignee,
  updateLeadFollowUp,
  updateLeadStatus,
} from '@/lib/adminData';
import { countDueFollowUps, isFollowUpDue, sortLeadsByFollowUp } from '@/lib/leadFollowUp';
import { buildLeadEmailPath, collectLeadIndustries, leadIndustry } from '@/lib/leadOutreach';
import { authErrorMessage } from '@/lib/auth';
import { confirmDelete, showErrorAlert, showSuccessToast } from '@/lib/sweetAlert';
import { useAuthStore } from '@/store/useAuthStore';
import {
  assigneeFieldsFromAdmin,
  SOURCE_BY_APP,
  type Lead,
  type LeadStatus,
  type LeadUpdateInput,
} from '@/types/admin';
import type { UserProfile } from '@/types/rental';

export function AdminLeadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [appId, setAppId] = useState<LeadAppFilter>('all');
  const [status, setStatus] = useState<LeadStatusFilter>('all');
  const [assignee, setAssignee] = useState<LeadAssigneeFilter>('all');
  const [followUp, setFollowUp] = useState<LeadFollowUpFilter>(
    searchParams.get('followUp') === 'due' ? 'due' : 'all',
  );
  const [industry, setIndustry] = useState<LeadIndustryFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [notesLead, setNotesLead] = useState<Lead | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.all([fetchLeads(), fetchAdmins()])
      .then(([nextLeads, nextAdmins]) => {
        if (!active) {
          return;
        }

        setLeads(nextLeads);
        setAdmins(nextAdmins);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(authErrorMessage(loadError));
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const result = leads.filter((lead) => {
      const matchesApp = appId === 'all' || lead.appId === appId;
      const matchesStatus = status === 'all' || lead.status === status;
      const matchesAssignee =
        assignee === 'all' ||
        (assignee === 'unassigned' ? !lead.assigneeId : lead.assigneeId === assignee);
      const matchesQuery =
        needle.length === 0 ||
        lead.name.toLowerCase().includes(needle) ||
        lead.email.toLowerCase().includes(needle) ||
        lead.summary.toLowerCase().includes(needle) ||
        lead.sourceDetail.toLowerCase().includes(needle) ||
        leadIndustry(lead).toLowerCase().includes(needle) ||
        lead.notes.some((note) => note.text.toLowerCase().includes(needle)) ||
        lead.assigneeName.toLowerCase().includes(needle);

      const matchesFollowUp =
        followUp === 'all' || isFollowUpDue(lead.followUpAt, lead.status);

      const matchesIndustry =
        industry === 'all' || leadIndustry(lead).toLowerCase() === industry.toLowerCase();

      return (
        matchesApp && matchesStatus && matchesAssignee && matchesQuery && matchesFollowUp && matchesIndustry
      );
    });

    return sortLeadsByFollowUp(result);
  }, [appId, assignee, followUp, industry, leads, query, status]);

  const industries = useMemo(() => collectLeadIndustries(leads), [leads]);
  const dueCount = useMemo(() => countDueFollowUps(leads), [leads]);

  const hasActiveFilters = useMemo(
    () =>
      appId !== 'all' ||
      status !== 'all' ||
      assignee !== 'all' ||
      followUp !== 'all' ||
      industry !== 'all' ||
      query.trim().length > 0,
    [appId, assignee, followUp, industry, query, status],
  );

  const clearFilters = useCallback(() => {
    setAppId('all');
    setStatus('all');
    setAssignee('all');
    setFollowUp('all');
    setIndustry('all');
    setQuery('');
  }, []);

  const openCreate = useCallback(() => {
    setEditingLead(null);
    setIsEditorOpen(true);
  }, []);

  const openImport = useCallback(() => {
    setIsImportOpen(true);
  }, []);

  const toolbar = useMemo(
    () => (
      <AdminPageToolbar>
        <Button variant="secondary" size="sm" className="min-h-9" onClick={openImport}>
          <FileUp className="size-4" aria-hidden="true" />
          Import Excel
        </Button>
        <Button size="sm" className="min-h-9" onClick={openCreate}>
          <UserPlus className="size-4" aria-hidden="true" />
          Add lead
        </Button>
      </AdminPageToolbar>
    ),
    [openCreate, openImport],
  );

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Leads' }, { label: 'Table' }],
      showSearch: true,
      searchQuery: query,
      searchPlaceholder: 'Search leads…',
      onSearchChange: setQuery,
      toolbar,
      notificationCount: dueCount,
    }),
    [query, toolbar, dueCount],
  );

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingLead(null);
  }, []);

  const openEdit = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsEditorOpen(true);
  }, []);

  const closeNotes = useCallback(() => {
    setNotesLead(null);
  }, []);

  const replaceLead = useCallback((next: Lead) => {
    setLeads((current) => current.map((lead) => (lead.leadId === next.leadId ? next : lead)));
    setNotesLead((current) => (current?.leadId === next.leadId ? next : current));
    setEditingLead((current) => (current?.leadId === next.leadId ? next : current));
  }, []);

  const handleAssignee = useCallback(
    async (leadId: string, nextAssigneeId: string) => {
      const admin = admins.find((item) => item.uid === nextAssigneeId) ?? null;
      const fields = assigneeFieldsFromAdmin(admin);
      setError('');
      try {
        await updateLeadAssignee(leadId, admin);
        setLeads((current) =>
          current.map((lead) => (lead.leadId === leadId ? { ...lead, ...fields } : lead)),
        );
      } catch (assigneeError) {
        setError(authErrorMessage(assigneeError));
      }
    },
    [admins],
  );

  const handleFollowUp = useCallback(async (leadId: string, followUpAt: string) => {
    setError('');
    try {
      await updateLeadFollowUp(leadId, followUpAt);
      setLeads((current) =>
        current.map((lead) => (lead.leadId === leadId ? { ...lead, followUpAt } : lead)),
      );
    } catch (followUpError) {
      setError(authErrorMessage(followUpError));
    }
  }, []);

  const handleStatus = useCallback(async (leadId: string, nextStatus: LeadStatus) => {
    setError('');
    try {
      await updateLeadStatus(leadId, nextStatus);
      setLeads((current) =>
        current.map((lead) => (lead.leadId === leadId ? { ...lead, status: nextStatus } : lead)),
      );
    } catch (statusError) {
      setError(authErrorMessage(statusError));
    }
  }, []);

  const handleBulkStatus = useCallback(
    async (leadIds: string[], nextStatus: LeadStatus) => {
      setError('');
      try {
        await Promise.all(leadIds.map((leadId) => updateLeadStatus(leadId, nextStatus)));
        setLeads((current) =>
          current.map((lead) =>
            leadIds.includes(lead.leadId) ? { ...lead, status: nextStatus } : lead,
          ),
        );
      } catch (statusError) {
        setError(authErrorMessage(statusError));
      }
    },
    [],
  );

  const handleBulkDelete = useCallback(async (leadIds: string[]) => {
    const confirmed = await confirmDelete({
      title: 'Delete leads?',
      text: `Delete ${leadIds.length} lead${leadIds.length === 1 ? '' : 's'}? This cannot be undone.`,
      confirmText: leadIds.length === 1 ? 'Delete lead' : `Delete ${leadIds.length} leads`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await Promise.all(leadIds.map((leadId) => deleteLead(leadId)));
      setLeads((current) => current.filter((item) => !leadIds.includes(item.leadId)));
      setNotesLead((current) => (current && leadIds.includes(current.leadId) ? null : current));
      setSelectedIds(new Set());
      showSuccessToast(
        leadIds.length === 1 ? 'Lead deleted' : `${leadIds.length} leads deleted`,
        'The selected leads were removed.',
      );
    } catch (deleteError) {
      showErrorAlert('Could not delete leads', authErrorMessage(deleteError));
    }
  }, []);

  const handleBulkMail = useCallback(
    (leadIds: string[]) => {
      const firstLead = leads.find((lead) => leadIds.includes(lead.leadId) && lead.email.trim());
      if (!firstLead) {
        showErrorAlert(
          'No email addresses',
          'None of the selected leads have an email address.',
        );
        return;
      }
      navigate(buildLeadEmailPath(firstLead));
    },
    [leads, navigate],
  );

  const handleCreate = useCallback(async (values: LeadUpdateInput) => {
    try {
      const created = await createLead({
        appId: values.appId,
        source: values.source ?? SOURCE_BY_APP[values.appId],
        sourceDetail: values.sourceDetail,
        name: values.name,
        email: values.email,
        summary: values.summary,
        status: values.status,
        followUpAt: values.followUpAt,
        assigneeId: values.assigneeId,
        assigneeName: values.assigneeName,
        metadata: values.serviceType?.trim() ? { serviceType: values.serviceType.trim() } : undefined,
      });
      setLeads((current) => [created, ...current]);
    } catch (createError) {
      throw new Error(authErrorMessage(createError));
    }
  }, []);

  const handleUpdate = useCallback(async (leadId: string, values: LeadUpdateInput) => {
    try {
      await updateLead(leadId, values);
      setLeads((current) =>
        current.map((lead) =>
          lead.leadId === leadId
            ? {
                ...lead,
                ...values,
                source: values.source ?? SOURCE_BY_APP[values.appId],
                followUpAt: values.followUpAt,
                metadata: {
                  ...lead.metadata,
                  serviceType: values.serviceType?.trim() ?? lead.metadata.serviceType,
                },
              }
            : lead,
        ),
      );
    } catch (updateError) {
      throw new Error(authErrorMessage(updateError));
    }
  }, []);

  const handleDelete = useCallback(async (lead: Lead) => {
    const confirmed = await confirmDelete({
      title: 'Delete lead?',
      text: `Delete the lead for ${lead.name}? This cannot be undone.`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteLead(lead.leadId);
      setLeads((current) => current.filter((item) => item.leadId !== lead.leadId));
      setNotesLead((current) => (current?.leadId === lead.leadId ? null : current));
      showSuccessToast('Lead deleted', `${lead.name} was removed.`);
    } catch (deleteError) {
      showErrorAlert('Could not delete lead', authErrorMessage(deleteError));
    }
  }, []);

  const handleAddNote = useCallback(
    async (lead: Lead, text: string) => {
      if (!user) {
        throw new Error('You need to be signed in.');
      }

      try {
        const note = await addLeadNote(lead, text, { uid: user.uid, name: user.name });
        replaceLead({ ...lead, notes: [...lead.notes, note] });
      } catch (noteError) {
        throw new Error(authErrorMessage(noteError));
      }
    },
    [replaceLead, user],
  );

  return (
    <AdminPage className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <LeadFilters
          appId={appId}
          status={status}
          assignee={assignee}
          followUp={followUp}
          industry={industry}
          industries={industries}
          admins={admins}
          resultCount={filtered.length}
          totalCount={leads.length}
          dueCount={dueCount}
          hasActiveFilters={hasActiveFilters}
          onAppChange={setAppId}
          onStatusChange={setStatus}
          onAssigneeChange={setAssignee}
          onFollowUpChange={setFollowUp}
          onIndustryChange={setIndustry}
          onClearFilters={clearFilters}
        />

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {isLoading ? (
            <LeadLoadingState />
          ) : (
            <LeadTable
              leads={filtered}
              admins={admins}
              paginate={false}
              hasActiveFilters={hasActiveFilters}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkStatus={handleBulkStatus}
              onBulkDelete={handleBulkDelete}
              onBulkMail={handleBulkMail}
              onStatus={handleStatus}
              onAssignee={handleAssignee}
              onFollowUp={handleFollowUp}
              onEdit={openEdit}
              onNotes={setNotesLead}
              onDelete={handleDelete}
              onClearFilters={clearFilters}
              onAddLead={openCreate}
              onImport={openImport}
              emptyLabel="No leads match these filters."
              className="min-h-0 flex-1"
            />
          )}
        </div>

        {error ? <p className="mt-3 shrink-0 text-sm text-danger">{error}</p> : null}
      </div>

      <LeadEditorModal
        isOpen={isEditorOpen}
        lead={editingLead}
        admins={admins}
        onClose={closeEditor}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
      <LeadNotesModal lead={notesLead} onClose={closeNotes} onAddNote={handleAddNote} />

      <LeadImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={(created) => {
          setLeads((current) => [...created, ...current]);
        }}
      />
    </AdminPage>
  );
}
