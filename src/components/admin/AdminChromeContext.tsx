import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface AdminBreadcrumb {
  label: string;
}

export interface AdminChromeConfig {
  breadcrumbs: AdminBreadcrumb[];
  searchQuery?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  toolbar?: ReactNode;
  notificationCount?: number;
}

const DEFAULT_CHROME: AdminChromeConfig = {
  breadcrumbs: [{ label: 'Overview' }],
  searchQuery: '',
  searchPlaceholder: 'Search…',
  showSearch: false,
  notificationCount: 0,
};

interface AdminChromeContextValue {
  chrome: AdminChromeConfig;
  setChrome: (config: AdminChromeConfig) => void;
  resetChrome: () => void;
}

const AdminChromeContext = createContext<AdminChromeContextValue | null>(null);

export function AdminChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChromeState] = useState<AdminChromeConfig>(DEFAULT_CHROME);

  const setChrome = useCallback((config: AdminChromeConfig) => {
    setChromeState(config);
  }, []);

  const resetChrome = useCallback(() => {
    setChromeState(DEFAULT_CHROME);
  }, []);

  const value = useMemo(
    () => ({ chrome, setChrome, resetChrome }),
    [chrome, resetChrome, setChrome],
  );

  return <AdminChromeContext.Provider value={value}>{children}</AdminChromeContext.Provider>;
}

export function useAdminChromeContext(): AdminChromeContextValue {
  const context = useContext(AdminChromeContext);
  if (!context) {
    throw new Error('useAdminChromeContext must be used within AdminChromeProvider');
  }
  return context;
}

export { DEFAULT_CHROME };
