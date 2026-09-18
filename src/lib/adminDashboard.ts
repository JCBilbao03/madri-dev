import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { countDueFollowUps, isFollowUpDue, sortLeadsByFollowUp, todayDateString } from '@/lib/leadFollowUp';
import { db } from '@/lib/firebase';
import type { AppId, Lead, LeadStatus } from '@/types/admin';
import type { MailMessage } from '@/types/email';

export interface DashboardLeadStats {
  total: number;
  dueFollowUps: number;
  newCount: number;
  unassigned: number;
  thisWeek: number;
  withoutEmail: number;
  byStatus: Record<LeadStatus, number>;
  byApp: Record<AppId, number>;
}

export interface InboxSnapshot {
  recent: MailMessage[];
  unreadCount: number;
  totalCount: number | null;
}

function weekStartIso(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

function asMailAddress(value: unknown): MailMessage['from'] {
  if (!value || typeof value !== 'object') {
    return { name: '', address: '' };
  }

  const record = value as Record<string, unknown>;
  return {
    name: typeof record.name === 'string' ? record.name : '',
    address: typeof record.address === 'string' ? record.address : '',
  };
}

function asMailAddressList(value: unknown): MailMessage['to'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => asMailAddress(item)).filter((item) => item.address.length > 0);
}

function parseInboxMessage(id: string, data: DocumentData): MailMessage | null {
  if (typeof data.uid !== 'number' || data.mailbox !== 'INBOX') {
    return null;
  }

  return {
    id,
    uid: data.uid,
    mailbox: 'INBOX',
    messageId: typeof data.messageId === 'string' ? data.messageId : '',
    inReplyTo: typeof data.inReplyTo === 'string' ? data.inReplyTo : '',
    references: Array.isArray(data.references)
      ? data.references.filter((item): item is string => typeof item === 'string')
      : [],
    from: asMailAddress(data.from),
    to: asMailAddressList(data.to),
    cc: asMailAddressList(data.cc),
    subject: typeof data.subject === 'string' ? data.subject : '',
    snippet: typeof data.snippet === 'string' ? data.snippet : '',
    bodyText: typeof data.bodyText === 'string' ? data.bodyText : '',
    bodyHtml: typeof data.bodyHtml === 'string' ? data.bodyHtml : undefined,
    date: typeof data.date === 'string' ? data.date : '',
    isRead: data.isRead === true,
    direction: data.direction === 'outbound' ? 'outbound' : 'inbound',
    syncedAt: typeof data.syncedAt === 'string' ? data.syncedAt : '',
  };
}

export function computeDashboardLeadStats(leads: Lead[]): DashboardLeadStats {
  const byStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    closed: 0,
  };
  const byApp: Record<AppId, number> = {
    marketing: 0,
    rental: 0,
    cleaning: 0,
    inventory: 0,
  };

  const weekStart = weekStartIso();
  let unassigned = 0;
  let thisWeek = 0;
  let withoutEmail = 0;

  for (const lead of leads) {
    byStatus[lead.status] += 1;
    byApp[lead.appId] += 1;

    if (lead.status !== 'closed' && !lead.assigneeId.trim()) {
      unassigned += 1;
    }

    if (lead.createdAt >= weekStart) {
      thisWeek += 1;
    }

    if (!lead.email.trim()) {
      withoutEmail += 1;
    }
  }

  return {
    total: leads.length,
    dueFollowUps: countDueFollowUps(leads),
    newCount: byStatus.new,
    unassigned,
    thisWeek,
    withoutEmail,
    byStatus,
    byApp,
  };
}

export function getDueFollowUpLeads(leads: Lead[], max = 6): Lead[] {
  return sortLeadsByFollowUp(leads.filter((lead) => isFollowUpDue(lead.followUpAt, lead.status))).slice(
    0,
    max,
  );
}

export function getRecentLeads(leads: Lead[], max = 5): Lead[] {
  return [...leads].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, max);
}

export function greetingForHour(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export function formatOverviewDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export async function fetchInboxSnapshot(maxRecent = 6): Promise<InboxSnapshot> {
  const inboxQuery = query(
    collection(db, 'mailMessages'),
    where('mailbox', '==', 'INBOX'),
    orderBy('date', 'desc'),
  );

  const [countResult, recentResult] = await Promise.all([
    getCountFromServer(inboxQuery).catch(() => null),
    getDocs(query(inboxQuery, limit(maxRecent))),
  ]);

  const recent = recentResult.docs
    .map((entry) => parseInboxMessage(entry.id, entry.data()))
    .filter((entry): entry is MailMessage => entry !== null);

  return {
    recent,
    unreadCount: recent.filter((message) => !message.isRead).length,
    totalCount: countResult?.data().count ?? null,
  };
}

export function isTodayFollowUp(followUpAt: string): boolean {
  return followUpAt === todayDateString();
}
