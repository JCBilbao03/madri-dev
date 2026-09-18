import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import geoip from 'geoip-lite';
import { createHash } from 'node:crypto';
import type { CallableRequest } from 'firebase-functions/v2/https';

import {
  DEMO_APP_IDS,
  type AppVisitSource,
  type DemoAppId,
  type RecordAppVisitInput,
} from './appVisitTypes';

const UNKNOWN_COUNTRY = 'UN';
const MAX_TIMEZONE_LENGTH = 64;
const MAX_LANGUAGE_LENGTH = 16;
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function isDemoAppId(value: string): value is DemoAppId {
  return (DEMO_APP_IDS as readonly string[]).includes(value);
}

function isAppVisitSource(value: string): value is AppVisitSource {
  return value === 'works' || value === 'direct';
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function readClientIp(request: CallableRequest<unknown>): string | null {
  const forwarded = request.rawRequest.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }

  if (Array.isArray(forwarded) && typeof forwarded[0] === 'string') {
    return forwarded[0].split(',')[0]?.trim() ?? null;
  }

  const socketIp = request.rawRequest.socket?.remoteAddress;
  if (typeof socketIp === 'string' && socketIp.length > 0) {
    return socketIp;
  }

  return null;
}

function countryFromIp(ip: string | null): string {
  if (!ip) {
    return UNKNOWN_COUNTRY;
  }

  const normalized = ip.replace(/^::ffff:/, '');
  const lookup = geoip.lookup(normalized);
  const country = lookup?.country?.trim().toUpperCase();

  if (!country || !/^[A-Z]{2}$/.test(country)) {
    return UNKNOWN_COUNTRY;
  }

  return country;
}

function dedupeKey(appId: DemoAppId, ip: string | null, windowStartMs: number): string {
  const salt = process.env.APP_VISIT_DEDUPE_SALT ?? 'madribuild-app-visit';
  const ipPart = ip ?? 'no-ip';
  const bucket = Math.floor(windowStartMs / DEDUPE_WINDOW_MS);

  return createHash('sha256').update(`${salt}:${appId}:${ipPart}:${bucket}`).digest('hex');
}

export function parseRecordAppVisitInput(data: unknown): RecordAppVisitInput {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request payload.');
  }

  const record = data as Record<string, unknown>;
  const appId = typeof record.appId === 'string' ? record.appId : '';
  const source = typeof record.source === 'string' ? record.source : '';

  if (!isDemoAppId(appId)) {
    throw new Error('Unknown demo app.');
  }

  if (!isAppVisitSource(source)) {
    throw new Error('Invalid visit source.');
  }

  const timezone =
    typeof record.timezone === 'string' && record.timezone.trim()
      ? clip(record.timezone, MAX_TIMEZONE_LENGTH)
      : undefined;
  const language =
    typeof record.language === 'string' && record.language.trim()
      ? clip(record.language, MAX_LANGUAGE_LENGTH)
      : undefined;

  return { appId, source, timezone, language };
}

export async function recordAppVisit(
  request: CallableRequest<unknown>,
  input: RecordAppVisitInput,
): Promise<{ recorded: boolean; country: string }> {
  const db = getFirestore();
  const ip = readClientIp(request);
  const country = countryFromIp(ip);
  const date = todayUtc();
  const nowMs = Date.now();
  const dedupeDocId = dedupeKey(input.appId, ip, nowMs);

  const dedupeRef = db.collection('appVisitDedupe').doc(dedupeDocId);
  const dailyRef = db.collection('appVisitDaily').doc(`${input.appId}_${date}`);
  const totalsRef = db.collection('appVisitTotals').doc(input.appId);

  const recorded = await db.runTransaction(async (transaction) => {
    const dedupeSnap = await transaction.get(dedupeRef);
    if (dedupeSnap.exists) {
      return false;
    }

    const expiresAt = new Date(nowMs + DEDUPE_WINDOW_MS);

    transaction.set(dedupeRef, {
      appId: input.appId,
      expiresAt,
      createdAt: new Date(nowMs).toISOString(),
    });

    const dailyUpdate: Record<string, unknown> = {
      appId: input.appId,
      date,
      totalViews: FieldValue.increment(1),
      countries: {
        [country]: FieldValue.increment(1),
      },
      updatedAt: new Date(nowMs).toISOString(),
    };

    if (input.source === 'works') {
      dailyUpdate.fromWorksViews = FieldValue.increment(1);
    }

    if (input.timezone) {
      dailyUpdate.timezones = {
        [input.timezone]: FieldValue.increment(1),
      };
    }

    if (input.language) {
      dailyUpdate.languages = {
        [input.language]: FieldValue.increment(1),
      };
    }

    transaction.set(dailyRef, dailyUpdate, { merge: true });

    const totalsUpdate: Record<string, unknown> = {
      appId: input.appId,
      totalViews: FieldValue.increment(1),
      countries: {
        [country]: FieldValue.increment(1),
      },
      updatedAt: new Date(nowMs).toISOString(),
    };

    if (input.source === 'works') {
      totalsUpdate.fromWorksViews = FieldValue.increment(1);
    }

    transaction.set(totalsRef, totalsUpdate, { merge: true });

    return true;
  });

  return { recorded, country };
}
