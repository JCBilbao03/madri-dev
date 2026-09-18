export type MailMailbox = 'INBOX' | 'Sent';

export type MailDirection = 'inbound' | 'outbound';

export interface MailAddress {
  name: string;
  address: string;
}

export interface MailMessageDoc {
  uid: number;
  mailbox: MailMailbox;
  messageId: string;
  inReplyTo: string;
  references: string[];
  from: MailAddress;
  to: MailAddress[];
  cc: MailAddress[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml?: string;
  date: string;
  isRead: boolean;
  direction: MailDirection;
  syncedAt: string;
}

export interface MailSyncResult {
  synced: number;
  mailboxes: MailMailbox[];
}

export interface MailSendInput {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  replyToMessageId?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface MailSendResult {
  messageId: string;
  accepted: string[];
}
