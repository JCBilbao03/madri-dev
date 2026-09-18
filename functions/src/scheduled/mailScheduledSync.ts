import { onSchedule } from 'firebase-functions/v2/scheduler';

import { mailSecrets, titanAppPasswordSecret, titanEmailSecret } from '../config/secrets';
import { syncMailboxes } from '../mail/sync';

const REGION = 'asia-southeast1';

export const mailScheduledSync = onSchedule(
  {
    region: REGION,
    schedule: 'every 10 minutes',
    secrets: mailSecrets,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async () => {
    const credentials = {
      email: titanEmailSecret.value().trim(),
      password: titanAppPasswordSecret.value().trim(),
    };

    if (!credentials.email || !credentials.password) {
      console.warn('mailScheduledSync skipped: Titan secrets are not configured.');
      return;
    }

    try {
      const result = await syncMailboxes(credentials);
      console.info('mailScheduledSync completed', result);
    } catch (error) {
      console.error('mailScheduledSync failed', error);
    }
  },
);
