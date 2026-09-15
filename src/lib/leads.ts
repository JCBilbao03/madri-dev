import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { sortLeadsByFollowUp } from '@/lib/leadFollowUp';
import { db, ensureAppCheckToken } from '@/lib/firebase';
import {
  asLead,
  assigneeFieldsFromAdmin,
  isLeadStatus,
  MAX_LEAD_NOTES,
  MAX_NOTE_TEXT,
  SOURCE_BY_APP,
  type Lead,
  type LeadAdminOption,
  type LeadNote,
  type LeadStatus,
  type LeadUpdateInput,
  type NewLeadInput,
} from '@/types/admin';

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function clipMetadata(metadata: NewLeadInput['metadata']): Lead['metadata'] {
  if (!metadata) {
    return {};
  }

  const next: Lead['metadata'] = {};
  const entries: [keyof Lead['metadata'], string | undefined][] = [
    ['propertyId', metadata.propertyId],
    ['applicationId', metadata.applicationId],
    ['tenantId', metadata.tenantId],
    ['bookingId', metadata.bookingId],
    ['cleanerId', metadata.cleanerId],
    ['serviceType', metadata.serviceType],
    ['address', metadata.address],
    ['itemCount', metadata.itemCount],
    ['skus', metadata.skus],
  ];

  for (const [key, value] of entries) {
    if (value) {
      next[key] = clip(value, 120);
    }
  }

  return next;
}

function clipFollowUpAt(value: string | undefined): string {
  const trimmed = clip(value ?? '', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return '';
  }

  return trimmed;
}

function clipAssignee(input: { assigneeId?: string; assigneeName?: string }): Pick<Lead, 'assigneeId' | 'assigneeName'> {
  const assigneeId = clip(input.assigneeId ?? '', 128);
  if (!assigneeId) {
    return { assigneeId: '', assigneeName: '' };
  }

  return {
    assigneeId,
    assigneeName: clip(input.assigneeName ?? '', 80) || 'Admin',
  };
}

export async function createLead(input: NewLeadInput): Promise<Lead> {
  const leadId = `ld-${crypto.randomUUID()}`;
  const status = input.status ?? 'new';
  const source = input.source ?? SOURCE_BY_APP[input.appId];
  const lead: Lead = {
    leadId,
    appId: input.appId,
    source,
    sourceDetail: source === 'other' ? clip(input.sourceDetail ?? '', 80) : '',
    name: clip(input.name, 80),
    email: clip(input.email, 120),
    summary: clip(input.summary, 400),
    status: isLeadStatus(status) ? status : 'new',
    createdAt: new Date().toISOString(),
    followUpAt: clipFollowUpAt(input.followUpAt),
    metadata: clipMetadata(input.metadata),
    notes: [],
    ...clipAssignee(input),
  };

  if (source === 'contact-form' || source === 'cleaning-booking' || source === 'inventory-export') {
    await ensureAppCheckToken();
  }

  await setDoc(doc(db, 'leads', leadId), lead);
  return lead;
}

/**
 * Records a conversion without blocking the caller. Marketing inquiries should
 * use `createLead` directly so the form can surface a write failure.
 */
export function captureLead(input: NewLeadInput): void {
  void createLead(input).catch(() => {
    if (import.meta.env.DEV) {
      console.warn('[MadriBuild] Lead capture failed', input.source);
    }
  });
}

export async function fetchLeads(): Promise<Lead[]> {
  const snapshot = await getDocs(collection(db, 'leads'));
  const leads = snapshot.docs
    .map((item) => asLead(item.id, item.data()))
    .filter((item): item is Lead => item !== null);

  return sortLeadsByFollowUp(leads);
}

export async function updateLeadFollowUp(leadId: string, followUpAt: string): Promise<void> {
  await updateDoc(doc(db, 'leads', leadId), { followUpAt: clipFollowUpAt(followUpAt) });
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  if (!isLeadStatus(status)) {
    throw new Error('Invalid lead status.');
  }

  await updateDoc(doc(db, 'leads', leadId), { status });
}

export async function updateLeadAssignee(leadId: string, admin: LeadAdminOption | null): Promise<void> {
  await updateDoc(doc(db, 'leads', leadId), assigneeFieldsFromAdmin(admin));
}

export async function updateLead(leadId: string, input: LeadUpdateInput): Promise<void> {
  await updateDoc(doc(db, 'leads', leadId), {
    appId: input.appId,
    source: input.source,
    sourceDetail: input.source === 'other' ? clip(input.sourceDetail, 80) : '',
    name: clip(input.name, 80),
    email: clip(input.email, 120),
    summary: clip(input.summary, 400),
    status: input.status,
    followUpAt: clipFollowUpAt(input.followUpAt),
    ...clipAssignee(input),
  });
}

export async function deleteLead(leadId: string): Promise<void> {
  await deleteDoc(doc(db, 'leads', leadId));
}

export async function addLeadNote(
  lead: Lead,
  text: string,
  author: { uid: string; name: string },
): Promise<LeadNote> {
  const trimmed = clip(text, MAX_NOTE_TEXT);
  if (trimmed.length === 0) {
    throw new Error('Write a note before saving.');
  }

  if (lead.notes.length >= MAX_LEAD_NOTES) {
    throw new Error(`A lead can have at most ${MAX_LEAD_NOTES} notes.`);
  }

  const note: LeadNote = {
    id: `nt-${crypto.randomUUID().slice(0, 8)}`,
    text: trimmed,
    createdAt: new Date().toISOString(),
    authorId: author.uid,
    authorName: clip(author.name, 80) || 'Admin',
  };

  await updateDoc(doc(db, 'leads', lead.leadId), {
    notes: [...lead.notes, note],
  });

  return note;
}
