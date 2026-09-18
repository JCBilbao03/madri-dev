import { useEffect, type DependencyList } from 'react';

import {
  DEFAULT_CHROME,
  useAdminChromeContext,
  type AdminChromeConfig,
} from '@/components/admin/AdminChromeContext';

/**
 * Registers page-level chrome (breadcrumbs, search, toolbar) with the admin shell.
 * Resets to defaults on unmount.
 */
export function useAdminChrome(getConfig: () => AdminChromeConfig, deps: DependencyList): void {
  const { setChrome, resetChrome } = useAdminChromeContext();

  useEffect(() => {
    setChrome(getConfig());
    return resetChrome;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}

export { DEFAULT_CHROME };
