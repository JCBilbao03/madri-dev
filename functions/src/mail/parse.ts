import { simpleParser, type AddressObject, type ParsedMail } from 'mailparser';

import type { MailAddress, MailDirection, MailMailbox, MailMessageDoc } from './types';

function normalizeAddress(entry: AddressObject | AddressObject[] | undefined): MailAddress[] {
  if (!entry) {
    return [];
  }

  const list = Array.isArray(entry) ? entry : [entry];

  return list.flatMap((group) =>
    (group.value ?? []).map((item: { name?: string; address?: string }) => ({
      name: item.name?.trim() ?? '',
      address: item.address?.trim().toLowerCase() ?? '',
    })),
  ).filter((item) => item.address.length > 0);
}

function firstAddress(entry: AddressObject | AddressObject[] | undefined): MailAddress {
  const addresses = normalizeAddress(entry);
  return addresses[0] ?? { name: '', address: '' };
}

function parseReferences(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  const raw = Array.isArray(value) ? value.join(' ') : value;
  const matches = raw.match(/<[^>]+>/g) ?? [];

  return matches.map((item) => item.trim()).filter(Boolean);
}

function buildSnippet(bodyText: string, subject: string): string {
  const source = bodyText.trim() || subject.trim();
  const compact = source.replace(/\s+/g, ' ').trim();
  return compact.length <= 180 ? compact : `${compact.slice(0, 177)}...`;
}

function directionForMailbox(mailbox: MailMailbox): MailDirection {
  return mailbox === 'Sent' ? 'outbound' : 'inbound';
}

export function docIdForMessage(mailbox: MailMailbox, uid: number): string {
  return `${mailbox}_${uid}`;
}

export async function parseRawMessage(
  mailbox: MailMailbox,
  uid: number,
  raw: Buffer,
  isRead: boolean,
  syncedAt: string,
): Promise<MailMessageDoc> {
  const parsed: ParsedMail = await simpleParser(raw);
  const bodyText = parsed.text?.trim() ?? '';
  const bodyHtml = typeof parsed.html === 'string' ? parsed.html.trim() : undefined;
  const messageId = parsed.messageId?.trim() ?? `${mailbox.toLowerCase()}-${uid}@madribuild.local`;
  const inReplyTo = typeof parsed.inReplyTo === 'string' ? parsed.inReplyTo.trim() : '';
  const references = parseReferences(parsed.references);
  const subject = parsed.subject?.trim() ?? '(No subject)';
  const date = parsed.date?.toISOString() ?? syncedAt;

  return {
    uid,
    mailbox,
    messageId,
    inReplyTo,
    references,
    from: firstAddress(parsed.from),
    to: normalizeAddress(parsed.to),
    cc: normalizeAddress(parsed.cc),
    subject,
    snippet: buildSnippet(bodyText, subject),
    bodyText,
    ...(bodyHtml ? { bodyHtml } : {}),
    date,
    isRead,
    direction: directionForMailbox(mailbox),
    syncedAt,
  };
}
