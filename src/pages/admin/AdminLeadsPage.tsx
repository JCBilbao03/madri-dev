import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeadEditorModal } from '@/components/admin/LeadEditorModal';
import {
  LeadFilters,
  type LeadAppFilter,
  type LeadAssigneeFilter,
  type LeadStatusFilter,
} from '@/components/admin/LeadFilters';
import { LeadNotesModal } from '@/components/admin/LeadNotesModal';
import { LeadTable } from '@/components/admin/LeadTable';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import {
  addLeadNote,
  createLead,
  deleteLead,
  fetchAdmins,
  fetchLeads,
  updateLead,
  updateLeadAssignee,
  updateLeadStatus,
} from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
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
  const user = useAuthStore((state) => state.user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [appId, setAppId] = useState<LeadAppFilter>('all');
  const [status, setStatus] = useState<LeadStatusFilter>('all');
  const [assignee, setAssignee] = useState<LeadAssigneeFilter>('all');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
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

    return leads.filter((lead) => {
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
        lead.notes.some((note) => note.text.toLowerCase().includes(needle)) ||
        lead.assigneeName.toLowerCase().includes(needle);

      return matchesApp && matchesStatus && matchesAssignee && matchesQuery;
    });
  }, [appId, assignee, leads, query, status]);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingLead(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditingLead(null);
    setIsEditorOpen(true);
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

  const handleStatus = useCallback(
    async (leadId: string, nextStatus: LeadStatus) => {
      setError('');
      try {
        await updateLeadStatus(leadId, nextStatus);
        setLeads((current) =>
          current.map((lead) => (lead.leadId === leadId ? { ...lead, status: nextStatus } : lead)),
        );
      } catch (statusError) {
        setError(authErrorMessage(statusError));
      }
    },
    [],
  );

  const handleCreate = useCallback(async (values: LeadUpdateInput) => {
    try {
      const created = await createLead({
        ...values,
        source: values.source ?? SOURCE_BY_APP[values.appId],
      });
      setLeads((current) => [created, ...current]);
    } catch (createError) {
      throw new Error(authErrorMessage(createError));
    }
  }, []);

  const handleUpdate = useCallback(
    async (leadId: string, values: LeadUpdateInput) => {
      try {
        await updateLead(leadId, values);
        setLeads((current) =>
          current.map((lead) =>
            lead.leadId === leadId
              ? {
                  ...lead,
                  ...values,
                  source: values.source ?? SOURCE_BY_APP[values.appId],
                }
              : lead,
          ),
        );
      } catch (updateError) {
        throw new Error(authErrorMessage(updateError));
      }
    },
    [],
  );

  const handleDelete = useCallback(async (lead: Lead) => {
    const confirmed = window.confirm(`Delete the lead for ${lead.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await deleteLead(lead.leadId);
      setLeads((current) => current.filter((item) => item.leadId !== lead.leadId));
      setNotesLead((current) => (current?.leadId === lead.leadId ? null : current));
    } catch (deleteError) {
      setError(authErrorMessage(deleteError));
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
    <main id="main" className="min-h-svh bg-base pt-36 pb-24 lg:pt-28 lg:pb-16">
      <Container className="max-w-[88rem]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-accent-soft">Admin</p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Lead monitoring</h1>
            <p className="mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">
              Add, edit, and delete leads, assign them to an admin, or attach follow-up notes.
            </p>
          </div>
          <Button variant="cta" className="w-full sm:w-auto" onClick={openCreate}>
            Add lead
          </Button>
        </div>

        <LeadFilters
          appId={appId}
          status={status}
          assignee={assignee}
          query={query}
          admins={admins}
          onAppChange={setAppId}
          onStatusChange={setStatus}
          onAssigneeChange={setAssignee}
          onQueryChange={setQuery}
        />

        <p className="mt-5 text-sm text-ink-muted">
          {isLoading ? 'Loading leads…' : `Showing ${filtered.length} of ${leads.length} leads`}
        </p>

        <div className="mt-3">
          {isLoading ? null : (
            <LeadTable
              leads={filtered}
              admins={admins}
              onStatus={handleStatus}
              onAssignee={handleAssignee}
              onEdit={openEdit}
              onNotes={setNotesLead}
              onDelete={handleDelete}
              emptyLabel="No leads match these filters."
            />
          )}
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Container>

      <LeadEditorModal
        isOpen={isEditorOpen}
        lead={editingLead}
        admins={admins}
        onClose={closeEditor}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
      <LeadNotesModal lead={notesLead} onClose={closeNotes} onAddNote={handleAddNote} />
    </main>
  );
}
