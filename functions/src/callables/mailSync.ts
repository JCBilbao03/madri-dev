import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { requireAdmin } from '../auth/adminGuard';
import { mailSecrets, titanAppPasswordSecret, titanEmailSecret } from '../config/secrets';
import { syncMailboxes } from '../mail/sync';
import { describeMailError } from '../mail/titan';

const REGION = 'asia-southeast1';

export const mailSync = onCall(
  {
    region: REGION,
    secrets: mailSecrets,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async (request) => {
    await requireAdmin(request);

    const credentials = {
      email: titanEmailSecret.value().trim(),
      password: titanAppPasswordSecret.value().trim(),
    };

    if (!credentials.email || !credentials.password) {
      throw new HttpsError('failed-precondition', 'Titan email secrets are not configured.');
    }

    try {
      return await syncMailboxes(credentials);
    } catch (error) {
      console.error('mailSync failed', error);

      if (error && typeof error === 'object' && 'authenticationFailed' in error && error.authenticationFailed) {
        throw new HttpsError('failed-precondition', describeMailError(error));
      }

      throw new HttpsError('internal', describeMailError(error));
    }
  },
);
