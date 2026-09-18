import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import {
  DEMO_APP_IDS,
  type AppVisitDailyDoc,
  type AppVisitTotalsDoc,
  type DemoAppId,
  type DemoAppTrafficSummary,
} from '@/types/appTraffic';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysUtc(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseDailyDoc(data: unknown, appId: DemoAppId, date: string): AppVisitDailyDoc {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};

  return {
    appId,
    date,
    totalViews: asNumber(record.totalViews),
    fromWorksViews: asNumber(record.fromWorksViews),
    countries: typeof record.countries === 'object' && record.countries ? (record.countries as Record<string, number>) : {},
    timezones: typeof record.timezones === 'object' && record.timezones ? (record.timezones as Record<string, number>) : {},
    languages: typeof record.languages === 'object' && record.languages ? (record.languages as Record<string, number>) : {},
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  };
}

function parseTotalsDoc(data: unknown, appId: DemoAppId): AppVisitTotalsDoc {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};

  return {
    appId,
    totalViews: asNumber(record.totalViews),
    fromWorksViews: asNumber(record.fromWorksViews),
    countries: typeof record.countries === 'object' && record.countries ? (record.countries as Record<string, number>) : {},
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  };
}

function topCountries(counts: Record<string, number>, limit = 5): Array<{ code: string; count: number }> {
  return Object.entries(counts)
    .filter(([code]) => code !== 'UN')
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([code, count]) => ({ code, count }));
}

export function countryLabel(code: string): string {
  if (code === 'UN') {
    return 'Unknown';
  }

  try {
    const display = new Intl.DisplayNames(undefined, { type: 'region' });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}

export async function fetchDemoAppTrafficSummaries(days = 7): Promise<DemoAppTrafficSummary[]> {
  const endDate = todayUtc();
  const startDate = addDaysUtc(endDate, -(days - 1));
  const dateKeys: string[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    dateKeys.push(addDaysUtc(startDate, offset));
  }

  const summaries = await Promise.all(
    DEMO_APP_IDS.map(async (appId) => {
      const [totalsSnap, ...dailySnaps] = await Promise.all([
        getDoc(doc(db, 'appVisitTotals', appId)),
        ...dateKeys.map((date) => getDoc(doc(db, 'appVisitDaily', `${appId}_${date}`))),
      ]);

      const totals = totalsSnap.exists()
        ? parseTotalsDoc(totalsSnap.data(), appId)
        : { appId, totalViews: 0, fromWorksViews: 0, countries: {} };

      const dailyDocs = dailySnaps
        .filter((snap) => snap.exists())
        .map((snap, index) => parseDailyDoc(snap.data(), appId, dateKeys[index]!));

      const viewsLast7Days = dailyDocs.reduce((sum, entry) => sum + entry.totalViews, 0);
      const weekCountries: Record<string, number> = {};

      for (const daily of dailyDocs) {
        for (const [code, count] of Object.entries(daily.countries ?? {})) {
          weekCountries[code] = (weekCountries[code] ?? 0) + count;
        }
      }

      return {
        appId,
        totalViews: totals.totalViews,
        fromWorksViews: totals.fromWorksViews ?? 0,
        viewsLast7Days,
        topCountries: topCountries(weekCountries),
      } satisfies DemoAppTrafficSummary;
    }),
  );

  return summaries;
}
