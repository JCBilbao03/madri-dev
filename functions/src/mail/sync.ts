import { getFirestore } from 'firebase-admin/firestore';

import type { MailMailbox, MailMessageDoc, MailSyncResult } from './types';
import { docIdForMessage, parseRawMessage } from './parse';
import { resolveSentMailbox, type TitanCredentials, withImapClient } from './titan';

const MAIL_COLLECTION = 'mailMessages';
const SYNC_LIMIT = 100;

async function syncMailbox(
  credentials: TitanCredentials,
  mailboxPath: string,
  mailbox: MailMailbox,
): Promise<number> {
  const syncedAt = new Date().toISOString();
  const db = getFirestore();
  let synced = 0;

  await withImapClient(credentials, async (client) => {
    const lock = await client.getMailboxLock(mailboxPath);

    try {
      const mailboxState = client.mailbox;
      const total = mailboxState && typeof mailboxState !== 'boolean' ? mailboxState.exists : 0;

      if (total === 0) {
        return;
      }

      const startSeq = Math.max(1, total - SYNC_LIMIT + 1);
      const range = `${startSeq}:*`;

      for await (const message of client.fetch(range, {
        uid: true,
        flags: true,
        source: true,
      })) {
        if (!message.source || !message.uid) {
          continue;
        }

        const isRead = message.flags?.has('\\Seen') ?? false;
        const doc = await parseRawMessage(mailbox, message.uid, message.source, isRead, syncedAt);
        const docId = docIdForMessage(mailbox, message.uid);

        await db.collection(MAIL_COLLECTION).doc(docId).set(doc, { merge: true });
        synced += 1;
      }
    } finally {
      lock.release();
    }
  });

  return synced;
}

export async function syncMailboxes(credentials: TitanCredentials): Promise<MailSyncResult> {
  const mailboxes: MailMailbox[] = ['INBOX'];
  let synced = await syncMailbox(credentials, 'INBOX', 'INBOX');

  const sentPath = await withImapClient(credentials, async (client) => resolveSentMailbox(client));

  if (sentPath) {
    mailboxes.push('Sent');
    synced += await syncMailbox(credentials, sentPath, 'Sent');
  }

  return { synced, mailboxes };
}

export async function fetchMessageByDocId(
  credentials: TitanCredentials,
  docId: string,
): Promise<MailMessageDoc | null> {
  const [mailboxRaw, uidRaw] = docId.split('_');
  if ((mailboxRaw !== 'INBOX' && mailboxRaw !== 'Sent') || !uidRaw) {
    return null;
  }

  const mailbox = mailboxRaw as MailMailbox;
  const uid = Number(uidRaw);

  if (!Number.isFinite(uid) || uid <= 0) {
    return null;
  }

  const syncedAt = new Date().toISOString();
  let parsed: MailMessageDoc | null = null;

  await withImapClient(credentials, async (client) => {
    const mailboxPath = mailbox === 'Sent' ? (await resolveSentMailbox(client)) ?? 'Sent' : 'INBOX';
    const lock = await client.getMailboxLock(mailboxPath);

    try {
      for await (const message of client.fetch(`${uid}`, { uid: true, flags: true, source: true }, { uid: true })) {
        if (!message.source || !message.uid) {
          continue;
        }

        const isRead = message.flags?.has('\\Seen') ?? false;
        parsed = await parseRawMessage(mailbox, message.uid, message.source, isRead, syncedAt);
      }
    } finally {
      lock.release();
    }
  });

  if (parsed) {
    await getFirestore().collection(MAIL_COLLECTION).doc(docId).set(parsed, { merge: true });
  }

  return parsed;
}
