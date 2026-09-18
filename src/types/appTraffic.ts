export const DEMO_APP_IDS = ['rental', 'cleaning', 'inventory'] as const;

export type DemoAppId = (typeof DEMO_APP_IDS)[number];

export type AppVisitSource = 'works' | 'direct';

export interface AppVisitDailyDoc {
  appId: DemoAppId;
  date: string;
  totalViews: number;
  fromWorksViews?: number;
  countries?: Record<string, number>;
  timezones?: Record<string, number>;
  languages?: Record<string, number>;
  updatedAt?: string;
}

export interface AppVisitTotalsDoc {
  appId: DemoAppId;
  totalViews: number;
  fromWorksViews?: number;
  countries?: Record<string, number>;
  updatedAt?: string;
}

export interface DemoAppTrafficSummary {
  appId: DemoAppId;
  totalViews: number;
  fromWorksViews: number;
  viewsLast7Days: number;
  topCountries: Array<{ code: string; count: number }>;
}
