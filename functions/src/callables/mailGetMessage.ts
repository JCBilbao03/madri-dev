import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { requireAdmin } from '../auth/adminGuard';
import { mailSecrets, titanAppPasswordSecret, titanEmailSecret } from '../config/secrets';
import { fetchMessageByDocId } from '../mail/sync';

const REGION = 'asia-southeast1';

interface MailGetMessageInput {
  messageDocId?: string;
}

export const mailGetMessage = onCall(
  {
    region: REGION,
    secrets: mailSecrets,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (request) => {
    await requireAdmin(request);

    const messageDocId = (request.data as MailGetMessageInput | undefined)?.messageDocId?.trim();

    if (!messageDocId) {
      throw new HttpsError('invalid-argument', 'messageDocId is required.');
    }

    const db = getFirestore();
    const snapshot = await db.collection('mailMessages').doc(messageDocId).get();

    if (snapshot.exists) {
      const data = snapshot.data();
      const bodyText = typeof data?.bodyText === 'string' ? data.bodyText : '';
      const bodyHtml = typeof data?.bodyHtml === 'string' ? data.bodyHtml : '';

      if (bodyText.trim().length > 0 || bodyHtml.trim().length > 0) {
        return { message: { id: snapshot.id, ...data } };
      }
    }

    const credentials = {
      email: titanEmailSecret.value().trim(),
      password: titanAppPasswordSecret.value().trim(),
    };

    if (!credentials.email || !credentials.password) {
      throw new HttpsError('failed-precondition', 'Titan email secrets are not configured.');
    }

    try {
      const message = await fetchMessageByDocId(credentials, messageDocId);

      if (!message) {
        throw new HttpsError('not-found', 'Message not found.');
      }

      return { message: { id: messageDocId, ...message } };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      console.error('mailGetMessage failed', error);
      throw new HttpsError('internal', 'Could not load message body.');
    }
  },
);
