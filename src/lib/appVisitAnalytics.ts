import { httpsCallable } from 'firebase/functions';

import { ensureAppCheckToken, functions } from '@/lib/firebase';
import type { AppVisitSource, DemoAppId } from '@/types/appTraffic';

const SESSION_PREFIX = 'madri-demo-visit-v1';

interface RecordAppVisitResult {
  recorded: boolean;
  country: string;
}

function readClientHints(): { timezone?: string; language?: string } {
  if (typeof window === 'undefined') {
    return {};
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;

  return {
    timezone: timezone?.trim() || undefined,
    language: language?.trim() || undefined,
  };
}

function hasRecordedSession(appId: DemoAppId): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    return window.sessionStorage.getItem(`${SESSION_PREFIX}:${appId}`) === '1';
  } catch {
    return false;
  }
}

function markRecordedSession(appId: DemoAppId): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(`${SESSION_PREFIX}:${appId}`, '1');
  } catch {
    // Ignore private browsing quota errors.
  }
}

/**
 * Records an anonymous aggregate demo-app visit. No cookies; sessionStorage dedupes
 * repeat loads in the same tab. IP is processed server-side and not stored.
 */
export async function recordDemoAppVisit(appId: DemoAppId, source: AppVisitSource): Promise<void> {
  if (hasRecordedSession(appId)) {
    return;
  }

  markRecordedSession(appId);

  try {
    await ensureAppCheckToken();
    const callable = httpsCallable<{ appId: DemoAppId; source: AppVisitSource; timezone?: string; language?: string }, RecordAppVisitResult>(
      functions,
      'recordAppVisit',
    );

    await callable({
      appId,
      source,
      ...readClientHints(),
    });
  } catch {
    // Analytics must never block navigation or app usage.
  }
}
