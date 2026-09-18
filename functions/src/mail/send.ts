import { getFirestore, FieldValue } from 'firebase-admin/firestore';

import { createSmtpTransport, type TitanCredentials } from './titan';
import type { MailSendInput, MailSendResult } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 20000;
const MAX_RECIPIENTS = 10;
const MIN_SEND_INTERVAL_MS = 5000;

function normalizeRecipients(values: string[] | undefined): string[] {
  if (!values) {
    return [];
  }

  const unique = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      continue;
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
      throw new Error(`Invalid email address: ${value}`);
    }

    unique.add(trimmed);
  }

  return [...unique];
}

function validateSendInput(input: MailSendInput): MailSendInput {
  const to = normalizeRecipients(input.to);
  const cc = normalizeRecipients(input.cc);
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (to.length === 0) {
    throw new Error('Add at least one recipient.');
  }

  if (to.length + cc.length > MAX_RECIPIENTS) {
    throw new Error(`Too many recipients (max ${MAX_RECIPIENTS}).`);
  }

  if (!subject) {
    throw new Error('Subject is required.');
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    throw new Error(`Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`);
  }

  if (!body) {
    throw new Error('Message body is required.');
  }

  if (body.length > MAX_BODY_LENGTH) {
    throw new Error(`Message body must be ${MAX_BODY_LENGTH} characters or fewer.`);
  }

  return {
    to,
    cc,
    subject,
    body,
    replyToMessageId: input.replyToMessageId?.trim(),
    inReplyTo: input.inReplyTo?.trim(),
    references: input.references?.map((item) => item.trim()).filter(Boolean),
  };
}

async function enforceRateLimit(adminUid: string): Promise<void> {
  const db = getFirestore();
  const ref = db.collection('mailRateLimits').doc(adminUid);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const lastSentAt = snapshot.data()?.lastSentAt;

    if (typeof lastSentAt === 'number' && now - lastSentAt < MIN_SEND_INTERVAL_MS) {
      throw new Error('Please wait a few seconds before sending another email.');
    }

    transaction.set(
      ref,
      {
        lastSentAt: now,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  });
}

export async function sendMail(
  credentials: TitanCredentials,
  adminUid: string,
  input: MailSendInput,
): Promise<MailSendResult> {
  const payload = validateSendInput(input);
  await enforceRateLimit(adminUid);

  const transport = createSmtpTransport(credentials);
  const headers: Record<string, string> = {};

  if (payload.inReplyTo) {
    headers['In-Reply-To'] = payload.inReplyTo;
  }

  if (payload.references && payload.references.length > 0) {
    headers.References = payload.references.join(' ');
  }

  const info = await transport.sendMail({
    from: credentials.email,
    to: payload.to.join(', '),
    cc: payload.cc && payload.cc.length > 0 ? payload.cc.join(', ') : undefined,
    subject: payload.subject,
    text: payload.body,
    headers,
  });

  const messageId =
    typeof info.messageId === 'string' && info.messageId.length > 0
      ? info.messageId
      : `<sent-${Date.now()}@madribuild.local>`;

  await getFirestore()
    .collection('mailSendLog')
    .add({
      adminUid,
      to: payload.to,
      cc: payload.cc ?? [],
      subject: payload.subject,
      messageId,
      replyToMessageId: payload.replyToMessageId ?? '',
      createdAt: FieldValue.serverTimestamp(),
    });

  return {
    messageId,
    accepted: info.accepted.map((item) => String(item)),
  };
}
