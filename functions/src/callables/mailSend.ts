import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { requireAdmin } from '../auth/adminGuard';
import { mailSecrets, titanAppPasswordSecret, titanEmailSecret } from '../config/secrets';
import { sendMail } from '../mail/send';
import type { MailSendInput } from '../mail/types';

const REGION = 'asia-southeast1';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export const mailSend = onCall(
  {
    region: REGION,
    secrets: mailSecrets,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (request) => {
    const adminUid = await requireAdmin(request);
    const data = request.data as Partial<MailSendInput> | undefined;

    const input: MailSendInput = {
      to: asStringArray(data?.to),
      cc: asStringArray(data?.cc),
      subject: typeof data?.subject === 'string' ? data.subject : '',
      body: typeof data?.body === 'string' ? data.body : '',
      replyToMessageId: typeof data?.replyToMessageId === 'string' ? data.replyToMessageId : undefined,
      inReplyTo: typeof data?.inReplyTo === 'string' ? data.inReplyTo : undefined,
      references: asStringArray(data?.references),
    };

    const credentials = {
      email: titanEmailSecret.value().trim(),
      password: titanAppPasswordSecret.value().trim(),
    };

    if (!credentials.email || !credentials.password) {
      throw new HttpsError('failed-precondition', 'Titan email secrets are not configured.');
    }

    try {
      return await sendMail(credentials, adminUid, input);
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw new HttpsError('invalid-argument', error.message);
      }

      console.error('mailSend failed', error);
      throw new HttpsError('internal', 'Could not send email. Please try again.');
    }
  },
);
