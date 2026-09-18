import { Boxes, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { DemoAppVisitTracker } from '@/components/analytics/DemoAppVisitTracker';
import { InventorySidebar } from '@/components/inventory/InventorySidebar';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'inventory-sidebar-collapsed';

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time
      dateTime={now.toISOString()}
      className="hidden font-display text-[11px] tracking-[0.14em] text-ink-muted tabular-nums sm:block"
    >
      {now.toLocaleTimeString('en-US', { hour12: false })}
    </time>
  );
}

interface InventoryNavbarProps {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

function InventoryNavbar({ mobileOpen, onToggleMobile }: InventoryNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/85 backdrop-blur-xl print:hidden">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-5 sm:h-18 sm:px-8 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md border border-line text-ink-muted transition-colors hover:border-[color:var(--inv-scan)]/40 hover:text-ink lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="inventory-sidebar-panel"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={onToggleMobile}
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>

          <Logo to="/" />
          <span className="hidden h-6 w-px bg-line md:block" aria-hidden="true" />
          <p className="hidden min-w-0 items-center gap-2 font-display text-[11px] tracking-[0.18em] text-ink-muted uppercase md:flex">
            <Boxes className="size-3.5 shrink-0 text-[color:var(--inv-scan)]" aria-hidden="true" />
            <span className="truncate">Dang Lifestyle Operations</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 font-display text-[10px] tracking-[0.18em] text-[color:var(--inv-scan)] uppercase sm:flex">
            <span className="inventory-live-dot size-1.5 rounded-full bg-[color:var(--inv-scan)]" aria-hidden="true" />
            Live
          </span>
          <LiveClock />
          <ThemeToggle className="rounded-md" />
        </div>
      </div>
    </header>
  );
}

export function InventoryLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsedPreference);

  usePageMeta({
    title: `Dang Lifestyle Operations — ${BRAND_NAME}`,
    description: `${BRAND_NAME} operations hub for barcodes, ASNs, damage claims, and refunds.`,
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
    if (!mobileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen]);

  return (
    <div className="inventory-shell flex min-h-svh flex-col">
      <DemoAppVisitTracker appId="inventory" />
      <InventoryNavbar mobileOpen={mobileOpen} onToggleMobile={handleToggleMobile} />
      <div className="flex min-h-0 flex-1 pt-16 sm:pt-18 lg:items-stretch">
        <InventorySidebar
          mobileOpen={mobileOpen}
          collapsed={sidebarCollapsed}
          onClose={handleCloseMobile}
          onToggleCollapsed={handleToggleCollapsed}
        />
        <div className={cn('flex min-w-0 flex-1 flex-col', mobileOpen && 'max-lg:overflow-hidden')}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
