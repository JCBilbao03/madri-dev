export const APP_IDS = ['marketing', 'rental', 'cleaning', 'inventory'] as const;

export type AppId = (typeof APP_IDS)[number];

export const APP_LEAD_SOURCES = ['contact-form', 'rental-application', 'cleaning-booking', 'inventory-export'] as const;

export const SOCIAL_LEAD_SOURCES = ['facebook', 'instagram'] as const;

export const BUSINESS_LEAD_SOURCES = ['linkedin', 'whatsapp'] as const;

export const OTHER_LEAD_SOURCE = 'other' as const;

export const LEAD_SOURCES = [
  ...APP_LEAD_SOURCES,
  ...SOCIAL_LEAD_SOURCES,
  ...BUSINESS_LEAD_SOURCES,
  OTHER_LEAD_SOURCE,
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const MAX_LEAD_NOTES = 20;
export const MAX_NOTE_TEXT = 1000;

export const SOURCE_BY_APP: Record<AppId, LeadSource> = {
  marketing: 'contact-form',
  rental: 'rental-application',
  cleaning: 'cleaning-booking',
  inventory: 'inventory-export',
};

export interface LeadMetadata {
  propertyId?: string;
  applicationId?: string;
  tenantId?: string;
  bookingId?: string;
  cleanerId?: string;
  serviceType?: string;
  address?: string;
  itemCount?: string;
  skus?: string;
}

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface LeadAdminOption {
  uid: string;
  name: string;
}

export interface Lead {
  leadId: string;
  appId: AppId;
  source: LeadSource;
  /** Custom label when source is "other". */
  sourceDetail: string;
  name: string;
  email: string;
  summary: string;
  status: LeadStatus;
  createdAt: string;
  /** Next reach-out date (YYYY-MM-DD). */
  followUpAt: string;
  metadata: LeadMetadata;
  notes: LeadNote[];
  assigneeId: string;
  assigneeName: string;
}

export interface NewLeadInput {
  appId: AppId;
  source: LeadSource;
  sourceDetail?: string;
  name: string;
  email: string;
  summary: string;
  status?: LeadStatus;
  metadata?: LeadMetadata;
  assigneeId?: string;
  assigneeName?: string;
  followUpAt?: string;
}

export interface LeadUpdateInput {
  appId: AppId;
  source: LeadSource;
  sourceDetail: string;
  name: string;
  email: string;
  summary: string;
  status: LeadStatus;
  followUpAt: string;
  assigneeId: string;
  assigneeName: string;
}

export const APP_LABELS: Record<AppId, string> = {
  marketing: 'MadriBuild site',
  rental: 'Rental',
  cleaning: 'Cleaning',
  inventory: 'Inventory',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  'contact-form': 'Contact form',
  'rental-application': 'Rental application',
  'cleaning-booking': 'Cleaning booking',
  'inventory-export': 'Inventory export',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  other: 'Other',
};

export const LEAD_SOURCE_GROUPS = [
  { label: 'App forms', sources: APP_LEAD_SOURCES },
  { label: 'Social media', sources: SOCIAL_LEAD_SOURCES },
  { label: 'Business apps', sources: BUSINESS_LEAD_SOURCES },
  { label: 'Other', sources: [OTHER_LEAD_SOURCE] as const },
] as const;

export function isAppId(value: unknown): value is AppId {
  return typeof value === 'string' && (APP_IDS as readonly string[]).includes(value);
}

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === 'string' && (LEAD_SOURCES as readonly string[]).includes(value);
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

export function asLeadMetadata(value: unknown): LeadMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const item = value as Record<string, unknown>;
  const metadata: LeadMetadata = {};
  const keys: (keyof LeadMetadata)[] = [
    'propertyId',
    'applicationId',
    'tenantId',
    'bookingId',
    'cleanerId',
    'serviceType',
    'address',
    'itemCount',
    'skus',
  ];

  for (const key of keys) {
    const entry = item[key];
    if (typeof entry === 'string' && entry.length > 0) {
      metadata[key] = entry;
    }
  }

  return metadata;
}

export function asLeadNote(value: unknown): LeadNote | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    typeof item.text !== 'string' ||
    typeof item.createdAt !== 'string' ||
    typeof item.authorId !== 'string' ||
    typeof item.authorName !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    text: item.text,
    createdAt: item.createdAt,
    authorId: item.authorId,
    authorName: item.authorName,
  };
}

export function asLeadNotes(value: unknown): LeadNote[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asLeadNote).filter((item): item is LeadNote => item !== null);
}

export function asLead(id: string, data: Record<string, unknown>): Lead | null {
  if (
    !isAppId(data.appId) ||
    !isLeadSource(data.source) ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.summary !== 'string' ||
    !isLeadStatus(data.status) ||
    typeof data.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    leadId: typeof data.leadId === 'string' ? data.leadId : id,
    appId: data.appId,
    source: data.source,
    sourceDetail: typeof data.sourceDetail === 'string' ? data.sourceDetail : '',
    name: data.name,
    email: data.email,
    summary: data.summary,
    status: data.status,
    createdAt: data.createdAt,
    followUpAt: typeof data.followUpAt === 'string' ? data.followUpAt : '',
    metadata: asLeadMetadata(data.metadata),
    notes: asLeadNotes(data.notes),
    assigneeId: typeof data.assigneeId === 'string' ? data.assigneeId : '',
    assigneeName: typeof data.assigneeName === 'string' ? data.assigneeName : '',
  };
}

export function formatLeadSource(lead: Pick<Lead, 'source' | 'sourceDetail'>): string {
  if (lead.source === 'other') {
    return lead.sourceDetail.trim() || LEAD_SOURCE_LABELS.other;
  }

  return LEAD_SOURCE_LABELS[lead.source];
}

export function leadAssigneeLabel(lead: Lead, admins: LeadAdminOption[]): string {
  if (!lead.assigneeId) {
    return 'Unassigned';
  }

  const match = admins.find((admin) => admin.uid === lead.assigneeId);
  const name = match?.name.trim() || lead.assigneeName.trim();
  return name || 'Assigned';
}

export function assigneeFieldsFromAdmin(admin: LeadAdminOption | null): Pick<Lead, 'assigneeId' | 'assigneeName'> {
  if (!admin) {
    return { assigneeId: '', assigneeName: '' };
  }

  return { assigneeId: admin.uid, assigneeName: admin.name.trim() || 'Admin' };
}

export function formatLeadDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
