import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AdminChromeProvider } from '@/components/admin/AdminChromeContext';
import { AdminContentHeader } from '@/components/admin/AdminContentHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';
const DESKTOP_MEDIA = '(min-width: 1024px)';

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function readIsDesktop(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(DESKTOP_MEDIA).matches;
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(readIsDesktop);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsedPreference);

  usePageMeta({
    title: `Admin — ${BRAND_NAME}`,
    description: `${BRAND_NAME} admin dashboard.`,
    robots: 'noindex, nofollow',
  });

  const handleToggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleToggleCollapsed = useCallback(() => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage errors in private browsing.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA);
    const onChange = () => {
      const matches = media.matches;
      setIsDesktop(matches);
      if (matches) {
        setMobileOpen(false);
      }
    };

    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <AdminChromeProvider>
      <div className="admin-ui flex h-dvh max-h-dvh overflow-hidden bg-base font-sans">
        <AdminSidebar
          mobileOpen={mobileOpen}
          collapsed={sidebarCollapsed}
          isDesktop={isDesktop}
          onClose={handleCloseMobile}
          onToggleCollapsed={handleToggleCollapsed}
        />
        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', mobileOpen && 'max-lg:overflow-hidden')}>
          <AdminContentHeader mobileOpen={mobileOpen} onToggleMobile={handleToggleMobile} />
          <div className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminChromeProvider>
  );
}
