export const DEMO_APP_IDS = ['marketing', 'rental', 'cleaning', 'inventory'] as const;

export type DemoAppId = (typeof DEMO_APP_IDS)[number];

export type AppVisitSource = 'works' | 'direct';

export interface RecordAppVisitInput {
  appId: DemoAppId;
  source: AppVisitSource;
  timezone?: string;
  language?: string;
}
