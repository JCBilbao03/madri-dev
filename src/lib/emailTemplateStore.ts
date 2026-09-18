import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import {
  DEFAULT_OUTREACH_EMAIL_TEMPLATES,
  type EmailTemplate,
} from '@/data/emailTemplates';
import { db } from '@/lib/firebase';

export interface StoredEmailTemplate extends EmailTemplate {
  sortOrder: number;
  updatedAt: string;
}

export type EmailTemplateInput = Pick<EmailTemplate, 'label' | 'subject' | 'body'>;

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function asStoredEmailTemplate(data: unknown, id: string): StoredEmailTemplate | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const label = typeof record.label === 'string' ? clip(record.label, 80) : '';
  const subject = typeof record.subject === 'string' ? clip(record.subject, 200) : '';
  const body = typeof record.body === 'string' ? clip(record.body, 10000) : '';
  const sortOrder = typeof record.sortOrder === 'number' ? record.sortOrder : 0;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : '';

  if (!label || !subject || !body) {
    return null;
  }

  return {
    id,
    label,
    subject,
    body,
    sortOrder,
    updatedAt,
  };
}

function defaultStoredTemplates(): StoredEmailTemplate[] {
  const updatedAt = new Date().toISOString();

  return DEFAULT_OUTREACH_EMAIL_TEMPLATES.map((template, index) => ({
    ...template,
    sortOrder: index,
    updatedAt,
  }));
}

async function seedDefaultTemplates(): Promise<StoredEmailTemplate[]> {
  const templates = defaultStoredTemplates();
  const batch = writeBatch(db);

  for (const template of templates) {
    batch.set(doc(db, 'emailTemplates', template.id), template);
  }

  await batch.commit();
  return templates;
}

export async function fetchEmailTemplates(): Promise<StoredEmailTemplate[]> {
  const snapshot = await getDocs(query(collection(db, 'emailTemplates'), orderBy('sortOrder', 'asc')));
  const templates = snapshot.docs
    .map((entry) => asStoredEmailTemplate(entry.data(), entry.id))
    .filter((entry): entry is StoredEmailTemplate => entry !== null);

  if (templates.length === 0) {
    return seedDefaultTemplates();
  }

  return templates;
}

export async function createEmailTemplate(input: EmailTemplateInput): Promise<StoredEmailTemplate> {
  const existing = await fetchEmailTemplates();
  const id = `tpl-${crypto.randomUUID().slice(0, 8)}`;
  const template: StoredEmailTemplate = {
    id,
    label: clip(input.label, 80),
    subject: clip(input.subject, 200),
    body: clip(input.body, 10000),
    sortOrder: existing.length,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'emailTemplates', id), template);
  return template;
}

export async function updateEmailTemplate(
  templateId: string,
  input: EmailTemplateInput,
): Promise<StoredEmailTemplate> {
  const existing = await fetchEmailTemplates();
  const current = existing.find((entry) => entry.id === templateId);

  if (!current) {
    throw new Error('Template not found.');
  }

  const template: StoredEmailTemplate = {
    ...current,
    label: clip(input.label, 80),
    subject: clip(input.subject, 200),
    body: clip(input.body, 10000),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'emailTemplates', templateId), template);
  return template;
}

export async function deleteEmailTemplate(templateId: string): Promise<void> {
  await deleteDoc(doc(db, 'emailTemplates', templateId));
}

export async function resetEmailTemplatesToDefaults(): Promise<StoredEmailTemplate[]> {
  const existing = await getDocs(collection(db, 'emailTemplates'));
  const batch = writeBatch(db);

  for (const entry of existing.docs) {
    batch.delete(entry.ref);
  }

  await batch.commit();
  return seedDefaultTemplates();
}
