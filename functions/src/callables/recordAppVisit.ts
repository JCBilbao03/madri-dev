import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { parseRecordAppVisitInput, recordAppVisit } from '../analytics/recordAppVisitCore';

const REGION = 'asia-southeast1';

export const recordAppVisitCallable = onCall(
  {
    region: REGION,
    enforceAppCheck: true,
  },
  async (request) => {
    let input;

    try {
      input = parseRecordAppVisitInput(request.data);
    } catch (error) {
      throw new HttpsError('invalid-argument', error instanceof Error ? error.message : 'Invalid payload.');
    }

    try {
      return await recordAppVisit(request, input);
    } catch (error) {
      console.error('recordAppVisit failed', error);
      throw new HttpsError('internal', 'Could not record visit.');
    }
  },
);
