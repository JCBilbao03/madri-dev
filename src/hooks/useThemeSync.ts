import { useEffect } from 'react';

import { applyTheme } from '@/lib/theme';
import { useUIStore } from '@/store/useUIStore';

/**
 * Mirrors the store's theme onto `<html>`. Persistence lives in the store's
 * `toggleTheme` action so only a deliberate choice is remembered.
 */
export function useThemeSync(): void {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}
