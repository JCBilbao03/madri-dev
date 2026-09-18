import { useEffect } from 'react';

import { recordDemoAppVisit } from '@/lib/appVisitAnalytics';
import type { AppVisitSource, DemoAppId } from '@/types/appTraffic';

interface DemoAppVisitTrackerProps {
  appId: DemoAppId;
  source?: AppVisitSource;
}

export function DemoAppVisitTracker({ appId, source = 'direct' }: DemoAppVisitTrackerProps) {
  useEffect(() => {
    void recordDemoAppVisit(appId, source);
  }, [appId, source]);

  return null;
}
