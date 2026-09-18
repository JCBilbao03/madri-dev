import { displaySender } from '@/components/admin/email/emailFormat';
import type { LeadStatus } from '@/types/admin';
import type { MailAddress, MailMessage } from '@/types/email';

const MADRI_MAILBOX = 'hello@madribuild.com';

function isMadriAddress(address: MailAddress): boolean {
  return address.address.trim().toLowerCase() === MADRI_MAILBOX;
}

/** Picks the external contact on a thread (not hello@madribuild.com). */
export function leadContactFromMailMessage(message: MailMessage): MailAddress {
  if (message.direction === 'outbound') {
    const external = message.to.find((item) => item.address.trim() && !isMadriAddress(item));
    if (external) {
      return external;
    }
  }

  if (message.from.address.trim() && !isMadriAddress(message.from)) {
    return message.from;
  }

  const fallback = message.to.find((item) => item.address.trim() && !isMadriAddress(item));
  return fallback ?? message.from;
}

export function leadNameFromMailMessage(message: MailMessage): string {
  const contact = leadContactFromMailMessage(message);
  const label = displaySender(contact);
  if (label && label !== 'Unknown sender') {
    return label;
  }

  return contact.address.split('@')[0] ?? 'Unknown contact';
}

export function leadEmailFromMailMessage(message: MailMessage): string {
  return leadContactFromMailMessage(message).address.trim();
}

export function leadSummaryFromMailMessage(message: MailMessage): string {
  const subject = message.subject.trim() || '(No subject)';
  const preview =
    message.snippet.trim() ||
    message.bodyText.trim().replace(/\s+/g, ' ').slice(0, 240) ||
    'Email thread from admin inbox.';

  return `Email: ${subject} — ${preview}`.slice(0, 400);
}

export function leadStatusFromMailMessage(message: MailMessage): LeadStatus {
  return message.direction === 'inbound' ? 'contacted' : 'new';
}
